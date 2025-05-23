import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Clock, AlertTriangle } from "lucide-react";

export default function GrandSlamOffer() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dominator-black to-dominator-dark/90">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-dominator-blue/10 text-dominator-blue mb-4">
            <Zap className="w-4 h-4 mr-2" />
            LIMITED TIME OFFER
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-dominator-light mb-6">
            Everything You Need to <span className="bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">10X Your Views</span>—
            <span className="block">Zero Manual Work</span>
          </h1>
          <p className="text-xl text-dominator-light/80 max-w-3xl mx-auto">
            Join the Dominator Alpha program and get access to our most powerful AI tools for content creation and scheduling.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Main Offer */}
          <div className="bg-dominator-dark/50 border border-dominator-dark/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-dominator-light">What's Included:</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-dominator-blue to-dominator-magenta rounded-full"></div>
              </div>

              <ul className="space-y-4">
                {[
                  "AI predicts trends 48 hours before competitors.",
                  "Auto-generates scroll-stopping hooks (proven templates).",
                  "One-click scheduling to TikTok, Reels, YouTube Shorts.",
                  "Real-time virality score for every post."
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-dominator-blue flex-shrink-0 mt-0.5 mr-3" />
                    <span className="text-dominator-light/90">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button 
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-dominator-blue to-dominator-magenta hover:from-dominator-blue/90 hover:to-dominator-magenta/90 text-dominator-black hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all"
                  size="lg"
                >
                  Join Dominator Alpha Now
                </Button>
                <p className="text-center text-dominator-light/60 text-sm mt-3">
                  <Clock className="inline-block w-4 h-4 mr-1 -mt-1" />
                  Bonuses expire in: <span className="font-bold text-dominator-blue">72:00:00</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bonuses */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-dominator-dark/70 to-dominator-black/70 border border-dominator-dark/50 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-dominator-light mb-6">
                <span className="bg-gradient-to-r from-dominator-blue to-dominator-magenta bg-clip-text text-transparent">
                  Limited-Time Bonuses
                </span>
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    title: "FREE 100 Viral Hook Templates",
                    value: "$297 Value",
                    description: "Proven templates that drive engagement and shares."
                  },
                  {
                    title: "Exclusive Trend Alerts Private Discord",
                    value: "$197 Value",
                    description: "Get real-time trend alerts before they go viral."
                  },
                  {
                    title: "1-On-1 AI Strategy Call",
                    value: "$500 Value",
                    description: "Personalized strategy session with our growth experts.",
                    highlight: true
                  }
                ].map((bonus, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border ${bonus.highlight ? 'border-dominator-magenta/50 bg-dominator-magenta/5' : 'border-dominator-dark/50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-dominator-light">{bonus.title}</h4>
                      <span className="text-sm px-2 py-1 rounded-full bg-dominator-blue/10 text-dominator-blue">
                        {bonus.value}
                      </span>
                    </div>
                    <p className="text-dominator-light/70 text-sm mt-2">{bonus.description}</p>
                    {bonus.highlight && (
                      <div className="mt-2 flex items-center text-xs text-dominator-magenta">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Limited availability
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-dominator-dark/30 border border-dominator-dark/50 rounded-2xl p-6 text-center">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-dominator-blue/10 text-dominator-blue mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                RISK-FREE GUARANTEE
              </div>
              <p className="text-dominator-light/80 text-sm">
                Try Dominator Alpha risk-free for 14 days. If you don't see results, we'll refund your money, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-2xl font-bold text-dominator-light text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                question: "When will I get access to the bonuses?",
                answer: "You'll receive immediate access to all bonuses after your purchase. The 1-on-1 strategy call will be scheduled within 48 hours of signup."
              },
              {
                question: "Is there a money-back guarantee?",
                answer: "Absolutely! We offer a 14-day money-back guarantee. If you're not satisfied for any reason, just let us know and we'll issue a full refund."
              },
              {
                question: "How long will these bonuses be available?",
                answer: "These bonuses are only available for the first 100 signups or until the timer runs out, whichever comes first."
              }
            ].map((item, index) => (
              <div key={index} className="bg-dominator-dark/30 border border-dominator-dark/50 rounded-xl p-5">
                <h3 className="font-medium text-dominator-light">{item.question}</h3>
                <p className="mt-2 text-dominator-light/70 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
