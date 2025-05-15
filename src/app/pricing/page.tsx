import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  // Organize plans by tier
  const individualPlans =
    plans?.filter(
      (plan: any) =>
        plan.name?.toLowerCase().includes("individual") ||
        plan.name?.toLowerCase().includes("basic"),
    ) || [];

  const teamPlans =
    plans?.filter(
      (plan: any) =>
        plan.name?.toLowerCase().includes("team") ||
        plan.name?.toLowerCase().includes("pro"),
    ) || [];

  const agencyPlans =
    plans?.filter(
      (plan: any) =>
        plan.name?.toLowerCase().includes("agency") ||
        plan.name?.toLowerCase().includes("enterprise"),
    ) || [];

  // Ensure we have at least one plan for each tier
  const tiers = [
    {
      name: "Individual",
      plans: individualPlans.length
        ? individualPlans
        : [
            {
              name: "Individual",
              amount: 999,
              interval: "month",
              popular: false,
            },
          ],
    },
    {
      name: "Team",
      plans: teamPlans.length
        ? teamPlans
        : [{ name: "Team", amount: 2999, interval: "month", popular: true }],
    },
    {
      name: "Agency",
      plans: agencyPlans.length
        ? agencyPlans
        : [{ name: "Agency", amount: 4999, interval: "month", popular: false }],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        <Tabs defaultValue="monthly" className="w-full max-w-7xl mx-auto mb-8">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-6">{tier.name}</h2>
                  {tier.plans
                    .filter(
                      (item: any) =>
                        item.interval === "month" || !item.interval,
                    )
                    .map((item: any, i: number) => (
                      <PricingCard key={item.id || i} item={item} user={user} />
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-6">{tier.name}</h2>
                  {tier.plans
                    .filter((item: any) => item.interval === "year")
                    .map((item: any, i: number) => (
                      <PricingCard key={item.id || i} item={item} user={user} />
                    ))}
                  {/* If no yearly plan exists, show monthly with calculated yearly price */}
                  {tier.plans.filter((item: any) => item.interval === "year")
                    .length === 0 &&
                    tier.plans
                      .filter(
                        (item: any) =>
                          item.interval === "month" || !item.interval,
                      )
                      .map((item: any, i: number) => (
                        <PricingCard
                          key={`yearly-${i}`}
                          item={{
                            ...item,
                            amount: Math.round(item.amount * 12 * 0.8), // 20% discount
                            interval: "year",
                          }}
                          user={user}
                        />
                      ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
