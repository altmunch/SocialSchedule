import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <Instagram className="w-6 h-6 text-blue-600" />
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Twitter className="w-6 h-6 text-blue-600" />
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Schedule Posts with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI-Powered
              </span>{" "}
              Optimization
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Automate your social media presence across multiple platforms with
              intelligent scheduling, customized content, and performance
              analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Try For Free
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>All platforms supported</span>
              </div>
            </div>

            <div className="mt-12 relative">
              <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                <Calendar className="w-16 h-16 text-blue-600 mx-auto" />
                <p className="mt-2 font-medium">Visual Content Calendar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
