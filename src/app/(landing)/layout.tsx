import type { Metadata } from "next";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SocialSchedule - AI-Powered Social Media Scheduler",
  description: "Schedule smarter, grow faster, and dominate social media with AI-powered scheduling",
  keywords: ["social media scheduler", "AI scheduling", "content calendar", "social media management", "automation"],
  authors: [{ name: "SocialSchedule Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://socialschedule.app",
    title: "SocialSchedule - AI-Powered Social Media Scheduler",
    description: "Schedule smarter, grow faster, and dominate social media with AI-powered scheduling",
    siteName: "SocialSchedule",
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full bg-storm text-lightning">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black_1px,transparent_1px)] [mask-size:100%_40px]"
          style={{
            backgroundImage: "url('/grid-pattern.svg')",
            backgroundSize: '40px 40px',
            opacity: 0.1
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-storm to-storm-dark/90" />
      </div>
      
      <main className={cn(
        "min-h-screen bg-background font-sans antialiased",
        "relative w-full min-h-screen flex flex-col"
      )}>
        {children}
      </main>
    </div>
  );
}
