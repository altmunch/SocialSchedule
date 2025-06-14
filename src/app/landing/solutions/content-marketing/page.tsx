import NavigationBar from '@/app/landing/components/NavigationBar';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const dynamic = 'force-static';

const benefits = [
  'AI-powered idea brainstorming',
  'Hook & caption generator',
  'Template library for any niche',
  'Schedule and automate publishing',
];

export default function ContentMarketingSolutionPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#5afcc0]">Content-Marketing Solution</h1>
        <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto">
          Never run out of scroll-stopping ideas. Let ClipsCommerce fuel your content calendar with proven, high-performing concepts.
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-20">
          {benefits.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-[#5afcc0]/10 border border-[#5afcc0]/20 rounded-xl p-8 text-left"
            >
              <h3 className="text-xl font-semibold text-[#5afcc0] mb-2">{b}</h3>
              <p className="text-white/70 text-sm">Boost engagement and conversions with AI-optimized storytelling.</p>
            </motion.div>
          ))}
        </div>

        <Link href="/dashboard" className="bg-[#5afcc0] hover:bg-[#5afcc0]/90 text-black px-10 py-5 rounded-xl font-bold shadow-lg shadow-[#5afcc0]/30 transition-all">
          Generate My Next Viral Idea
        </Link>
      </div>
    </div>
  );
} 