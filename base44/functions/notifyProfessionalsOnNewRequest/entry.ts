import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    if (event?.type !== "create") {
      return Response.json({ ok: true, skipped: true });
    }

    const request = data;
    if (!request || !request.is_public || request.status !== "active") {
      return Response.json({ ok: true, skipped: "not a public active request" });
    }

    const requestCategory = request.category_name?.toLowerCase().trim();

    // Get all approved, active professionals
    const professionals = await base44.asServiceRole.entities.ProfessionalProfile.filter({
      verification_status: "approved",
      is_active: true
    });

    // Filter to those whose service_categories include the request's category
    const matchingPros = professionals.filter(pro => {
      if (!pro.service_categories?.length) return false;
      return pro.service_categories.some(cat =>
        cat.toLowerCase().trim().includes(requestCategory) ||
        requestCategory.includes(cat.toLowerCase().trim())
      );
    });

    if (matchingPros.length === 0) {
      return Response.json({ ok: true, notified: 0 });
    }

    const budgetText = request.budget_min
      ? `Budget: $${request.budget_min.toLocaleString()}–$${(request.budget_max || request.budget_min).toLocaleString()} CAD`
      : "Budget: Open";

    await Promise.all(matchingPros.map(pro =>
      base44.asServiceRole.entities.Notification.create({
        user_id: pro.user_id,
        type: "new_request",
        title: `New request in ${request.category_name} 🆕`,
        message: `"${request.title}" — ${request.city}, ${request.province}. ${budgetText}. Be one of the first to submit an offer!`,
        link: `/requests/${request.id}/offer`,
        is_read: false,
        metadata: { request_id: request.id, category: request.category_name }
      })
    ));

    return Response.json({ ok: true, notified: matchingPros.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});