import NavigationBar from '@/app/landing/components/NavigationBar';

export const dynamic = 'force-static';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      <div className="pt-32 pb-24 text-center px-6">
        <h1 className="text-5xl font-bold mb-6 text-[#8D5AFF]">API Documentation</h1>
        <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto">
          Our developer API will be launching soon. Sign up for our newsletter to be notified when it's live.
        </p>
        <a
          href="mailto:hello@clipscommerce.com?subject=Notify me about API Docs"
          className="inline-block bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white px-8 py-4 rounded-lg font-bold shadow-lg transition-all"
        >
          Join Waitlist
        </a>
      </div>
    </div>
  );
}
