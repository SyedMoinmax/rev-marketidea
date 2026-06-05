import { base44 } from '@/api/base44Client';

export async function validateOffer(offer, request, professionalProfile) {
  const prompt = `You are an AI Offer Validation Engine for OfferMatch Canada, a reverse marketplace platform.

Analyze this professional offer for a customer request and provide a validation result.

CUSTOMER REQUEST:
- Title: ${request.title}
- Description: ${request.description}
- Category: ${request.category_name}
- Subcategory: ${request.subcategory_name || 'N/A'}
- Location: ${request.city}, ${request.province}, Canada
- Budget Range: $${request.budget_min || 0} - $${request.budget_max || 'Open'} CAD
- Timeline: ${request.timeline}
- Priority: ${request.priority}

PROFESSIONAL OFFER:
- Price: $${offer.price} CAD (${offer.price_type})
- Timeline: ${offer.timeline}
- Scope: ${offer.scope}
- Deliverables: ${(offer.deliverables || []).join(', ')}
- Description: ${offer.description}

PROFESSIONAL PROFILE:
- Business: ${professionalProfile?.business_name || 'Unknown'}
- Years Experience: ${professionalProfile?.years_experience || 0}
- Average Rating: ${professionalProfile?.average_rating || 0}/5
- Review Count: ${professionalProfile?.review_count || 0}
- Offer Acceptance Rate: ${professionalProfile?.offer_acceptance_rate || 0}%
- Verification Status: ${professionalProfile?.verification_status || 'pending'}

ANALYSIS REQUIREMENTS:
Analyze based on:
1. Market pricing for ${request.category_name} in ${request.city}, ${request.province}, Canada
2. Price alignment with local Canadian market rates
3. Scope completeness relative to price
4. Timeline realism
5. Professional reputation and track record
6. Deliverables clarity and value

Return a JSON object with this EXACT structure:
{
  "validation_status": "green" | "yellow" | "red",
  "validation_message": "Brief main message",
  "validation_recommendations": ["recommendation 1", "recommendation 2"],
  "overall_score": <0-100>,
  "price_score": <0-100>,
  "quality_score": <0-100>,
  "reputation_score": <0-100>,
  "reliability_score": <0-100>,
  "market_alignment_score": <0-100>,
  "score_label": "Excellent" | "Good" | "Fair" | "Needs Improvement",
  "analysis_summary": "2-3 sentence market analysis"
}

GREEN: Price within 10% of market average, good scope, realistic timeline, acceptable reputation
YELLOW: Price 10-30% above market, or missing deliverables, or scope issues (provide specific recommendations)
RED: Price >30% above market, suspicious proposal, incomplete scope, or platform rule violations

Be specific about Canadian market rates for ${request.city}, ${request.province}.`;

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