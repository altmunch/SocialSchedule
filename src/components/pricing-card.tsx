"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Check } from "lucide-react";
import { supabase } from "../../supabase/supabase";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/sign-in?redirect=pricing";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  // Define features based on plan tier
  const getPlanFeatures = (planName: string | undefined) => {
    const baseFeatures = [
      "Schedule posts across platforms",
      "Basic analytics dashboard",
      "5 social media accounts",
    ];

    const proFeatures = [
      "AI-powered optimal scheduling",
      "Platform-specific customization",
      "Advanced analytics dashboard",
      "15 social media accounts",
      "Priority support",
    ];

    const enterpriseFeatures = [
      "Custom AI scheduling algorithms",
      "Unlimited social media accounts",
      "Team collaboration tools",
      "White-label reports",
      "Dedicated account manager",
      "API access",
    ];

    // Check if planName exists before calling toLowerCase
    if (!planName) return baseFeatures;

    const planNameLower = planName.toLowerCase();
    if (planNameLower.includes("pro")) return proFeatures;
    if (planNameLower.includes("enterprise")) return enterpriseFeatures;
    return baseFeatures;
  };

  const features = getPlanFeatures(item?.name);

  // Format price display based on interval
  const formatPrice = () => {
    if (!item?.amount) return "$0";

    const price = item.amount / 100;
    const interval = item?.interval?.toLowerCase() || "month";

    if (interval === "year") {
      return `${price} / year`;
    } else {
      return `${price} / month`;
    }
  };

  // Calculate monthly equivalent for yearly plans
  const monthlyEquivalent = () => {
    if (
      !item?.amount ||
      !item?.interval ||
      item.interval.toLowerCase() !== "year"
    )
      return null;

    const yearlyPrice = item.amount / 100;
    const monthlyPrice = Math.round((yearlyPrice / 12) * 100) / 100;
    return `${monthlyPrice}/mo`;
  };

  return (
    <Card
      className={`w-full max-w-[350px] relative overflow-hidden mb-6 ${item?.popular ? "border-2 border-blue-500 shadow-xl" : "border border-gray-200"}`}
    >
      {item?.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-30" />
      )}
      <CardHeader className="relative">
        {item?.popular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
          {item?.name || "Plan"}
        </CardTitle>
        <CardDescription className="flex flex-col mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice()}
            </span>
          </div>
          {monthlyEquivalent() && (
            <span className="text-sm text-gray-500 mt-1">
              ({monthlyEquivalent()} billed annually)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ul className="space-y-3 mt-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="relative">
        <Button
          onClick={async () => {
            if (item?.id) {
              await handleCheckout(item.id);
            }
          }}
          className={`w-full py-6 text-lg font-medium`}
          disabled={!item?.id}
          variant={item?.popular ? "default" : "outline"}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
