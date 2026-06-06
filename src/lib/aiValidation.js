import { base44 } from '@/api/base44Client';

export async function validateOffer(offer, request, professionalProfile) {
  const budgetMin = request.budget_min || null;
  const budgetMax = request.budget_max || null;
  const offerPrice = parseFloat(offer.price);

  const budgetContext = budgetMin && budgetMax
    ? `The customer's stated budget is $${budgetMin}–$${budgetMax} CAD. The professional is offering $${offerPrice} CAD.`
    : budgetMax
    ? `The customer's stated budget is up to $${budgetMax} CAD. The professional is offering $${offerPrice} CAD.`
    : `The professional is offering $${offerPrice} CAD. No specific budget was set by the customer.`;

  const prompt = `You are an AI Offer Validation Engine for a Canadian reverse marketplace platform.

Your job is to evaluate whether a professional's offer is fair and reasonable FOR THIS SPECIFIC REQUEST.

CRITICAL RULE: The customer's stated budget is your PRIMARY reference point for pricing. The offer must be evaluated relative to the customer's budget first, then general market rates second. If the offer is within the customer's budget, it should NOT be marked red for price reasons alone.

${budgetContext}

CUSTOMER REQUEST:
- Title: ${request.title}
- Description: ${request.description}
- Category: ${request.category_name}${request.subcategory_name ? ` > ${request.subcategory_name}` : ''}
- Location: ${request.city}, ${request.province}, Canada
- Customer Budget: ${budgetMin && budgetMax ? `$${budgetMin}–$${budgetMax} CAD` : budgetMax ? `Up to $${budgetMax} CAD` : 'Not specified'}
- Timeline Requested: ${request.timeline}
- Priority: ${request.priority}

PROFESSIONAL OFFER:
- Offered Price: $${offerPrice} CAD (${offer.price_type})
- Proposed Timeline: ${offer.timeline || 'Not specified'}
- Scope: ${offer.scope || 'Not specified'}
- Deliverables: ${(offer.deliverables || []).filter(d => d).join(', ') || 'Not specified'}
- Description: ${offer.description || 'Not specified'}

PROFESSIONAL PROFILE:
- Business: ${professionalProfile?.business_name || 'Not provided'}
- Years Experience: ${professionalProfile?.years_experience || 0}
- Average Rating: ${professionalProfile?.average_rating || 0}/5 (${professionalProfile?.review_count || 0} reviews)
- Verification Status: ${professionalProfile?.verification_status || 'pending'}

VALIDATION RULES (apply in this order):
1. PRICE vs CUSTOMER BUDGET: If offer price is within the customer's stated budget range → strong positive signal. If it exceeds the budget by less than 20% → yellow with explanation. If it exceeds by more than 20% → red.
2. If no customer budget was set → evaluate against typical ${request.category_name} market rates in ${request.city}, ${request.province}.
3. GREEN: Offer is within budget (or close), has reasonable scope and timeline, professional has some credibility.
4. YELLOW: Offer slightly exceeds budget, OR scope/deliverables are vague and need improvement. Give clear, actionable fixes.
5. RED: Offer significantly exceeds budget, OR deliverables/description are completely empty/nonsensical.

IMPORTANT: Be consistent. Do NOT contradict the customer's own budget. If a customer set $500–$700 as their budget, do not say the market rate is $1,000. The customer knows their own needs and budget.

Return a JSON object with this EXACT structure:
{
  "validation_status": "green" | "yellow" | "red",
  "validation_message": "One clear sentence summarizing the result",
  "validation_recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2"],
  "overall_score": <0-100>,
  "price_score": <0-100>,
  "quality_score": <0-100>,
  "reputation_score": <0-100>,
  "reliability_score": <0-100>,
  "market_alignment_score": <0-100>,
  "score_label": "Excellent" | "Good" | "Fair" | "Needs Improvement",
  "analysis_summary": "2-3 sentence analysis that references the actual budget and offered price"
}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        validation_status: { type: "string" },
        validation_message: { type: "string" },
        validation_recommendations: { type: "array", items: { type: "string" } },
        overall_score: { type: "number" },
        price_score: { type: "number" },
        quality_score: { type: "number" },
        reputation_score: { type: "number" },
        reliability_score: { type: "number" },
        market_alignment_score: { type: "number" },
        score_label: { type: "string" },
        analysis_summary: { type: "string" }
      }
    }
  });

  return response;
}