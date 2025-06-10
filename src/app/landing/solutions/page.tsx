import Link from 'next/link';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 flex flex-col gap-12 items-center justify-center">
      <section className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold mb-4">E-commerce</h2>
        <p className="mb-6 text-gray-300">Automate your social media content, optimize for sales, and track revenue with our all-in-one platform for e-commerce sellers.</p>
        <Link href="/dashboard">
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">Get Started</button>
        </Link>
      </section>
      <section className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Short-form Content Marketing</h2>
        <p className="mb-6 text-gray-300">Creators and agencies: streamline your short-form content marketing, automate posting, and gain actionable analytics to grow your audience.</p>
        <Link href="/dashboard">
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">Get Started</button>
        </Link>
      </section>
    </div>
  );
} 