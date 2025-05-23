import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.className,
        "min-h-screen bg-dominator-black text-dominator-light antialiased"
      )}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
