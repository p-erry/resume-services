export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  });
}
