import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    // Only process new profile creations
    if (event?.type !== "create") {
      return Response.json({ ok: true, skipped: true });
    }

    const profile = data;
    if (!profile) {
      return Response.json({ ok: true, skipped: "no data" });
    }

    // Notify all admin users about the new profile needing review
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

    if (admins.length > 0) {
      await Promise.all(admins.map(admin =>
        base44.asServiceRole.entities.Notification.create({
          user_id: admin.id,
          type: "verification_approved", // closest available type
          title: "New professional profile needs review 🆕",
          message: `${profile.business_name || "A new professional"} has completed their registration and is awaiting approval.`,
          is_read: false,
          metadata: { profile_id: profile.id, user_id: profile.user_id }
        })
      ));
    }

    // Send confirmation to the professional
    await base44.asServiceRole.entities.Notification.create({
      user_id: profile.user_id,
      type: "system",
      title: "Profile submitted for review",
      message: "Your business profile has been submitted. Our team will review it and notify you within 24-48 hours.",
      is_read: false
    });

    return Response.json({ ok: true, admins_notified: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});