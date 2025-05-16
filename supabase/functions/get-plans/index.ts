import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const plans = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    // Add default values to ensure data consistency
    const safeData = plans.data.map((price) => {
      const product = price.product as Stripe.Product;
      const popular = product?.metadata?.popular === "true";

      return {
        id: price.id,
        name:
          price.nickname ||
          product?.name ||
          `${price.currency.toUpperCase()} ${price.unit_amount ? price.unit_amount / 100 : 0}/${price.recurring?.interval}`,
        amount: price.unit_amount || 0,
        interval: price.recurring?.interval || "month",
        currency: price.currency || "usd",
        popular: popular,
      };
    });

    return new Response(JSON.stringify(safeData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
