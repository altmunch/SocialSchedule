import NavigationBar from '@/app/landing/components/NavigationBar';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const dynamic = 'force-static';

const platforms = ['Shopify', 'WooCommerce', 'Amazon', 'Etsy', 'BigCommerce'];
const stats = [
  { value: '$3.2M+', label: 'Sales Generated' },
  { value: '58%', label: 'Avg. Conversion Increase' },
  { value: '12K+', label: 'Active Sellers' },
];

export default function EcommerceSolutionPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#8D5AFF]">E-Commerce Growth Solution</h1>
        <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto">
          Connect your store, track revenue in real-time, and let ClipsCommerce turn short-form video into measurable sales.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {platforms.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-md text-white/80 hover:text-white hover:border-white/20 transition-colors"
            >
              {p}
            </motion.div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-8 mb-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-[#8D5AFF]/10 border border-[#8D5AFF]/20 rounded-xl p-8"
            >
              <p className="text-4xl font-bold text-[#8D5AFF] mb-2">{s.value}</p>
              <p className="text-white/70 text-sm uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <Link href="/dashboard" className="bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white px-10 py-5 rounded-xl font-bold shadow-lg shadow-[#8D5AFF]/30 transition-all">
          Start Driving Sales
        </Link>
      </div>
    </div>
  );
} 