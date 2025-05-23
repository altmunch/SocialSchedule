import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createServerClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Pricing() {
  const supabase = await createServerClient();
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
              currency: "usd",
            },
          ],
    },
    {
      name: "Team",
      plans: teamPlans.length
        ? teamPlans
        : [
            {
              name: "Team",
              amount: 2999,
              interval: "month",
              popular: true,
              currency: "usd",
            },
          ],
    },
    {
      name: "Agency",
      plans: agencyPlans.length
        ? agencyPlans
        : [
            {
              name: "Agency",
              amount: 4999,
              interval: "month",
              popular: false,
              currency: "usd",
            },
          ],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-dominator-light/80 max-w-2xl mx-auto">
            Choose the perfect plan that fits your needs and scale with our flexible pricing options
          </p>
        </div>

        <Tabs defaultValue="monthly" className="w-full max-w-7xl mx-auto mb-8">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-dominator-dark/50 p-1 rounded-lg border border-dominator-dark/50">
              <TabsTrigger 
                value="monthly"
                className="data-[state=active]:bg-dominator-dark data-[state=active]:text-dominator-blue data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all duration-200"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger 
                value="yearly" 
                className="data-[state=active]:bg-dominator-dark data-[state=active]:text-dominator-green data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all duration-200"
              >
                Yearly <span className="ml-1.5 px-1.5 py-0.5 bg-dominator-green/10 text-dominator-green text-xs rounded-full">Save 20%</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-6 text-dominator-light">
                    {tier.name}
                    {tier.plans.some((p: any) => p.popular) && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-dominator-blue to-dominator-magenta text-dominator-black rounded-full">
                        Popular
                      </span>
                    )}
                  </h2>
                  {tier.plans
                    .filter(
                      (item: any) =>
                        item.interval === "month" || !item.interval,
                    )
                    .map((item: any, i: number) => (
                      <div key={item.id || i} className="w-full">
                        <PricingCard item={item} user={user} />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-6 text-dominator-light">
                    {tier.name}
                    {tier.plans.some((p: any) => p.popular) && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-dominator-blue to-dominator-magenta text-dominator-black rounded-full">
                        Popular
                      </span>
                    )}
                  </h2>
                  {tier.plans
                    .filter((item: any) => item.interval === "year")
                    .map((item: any, i: number) => (
                      <div key={item.id || i} className="w-full">
                        <PricingCard item={item} user={user} />
                      </div>
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
                        <div key={`yearly-${i}`} className="w-full">
                          <PricingCard
                            item={{
                              ...item,
                              amount: Math.round(item.amount * 12 * 0.8), // 20% discount
                              interval: "year",
                            }}
                            user={user}
                          />
                        </div>
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
