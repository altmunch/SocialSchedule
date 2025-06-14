import { motion } from 'framer-motion';
import { Mail, Twitter, Facebook } from 'lucide-react';

export default function ContactSection() {
  const contacts = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:hello@clipscommerce.com',
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://twitter.com/clipscommerce',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: 'https://facebook.com/clipscommerce',
    },
  ];

  return (
    <section className="py-12 bg-black border-t border-white/10">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
        <motion.h3
          className="text-2xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Get in Touch
        </motion.h3>
        <div className="flex items-center justify-center gap-6">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[#8D5AFF] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <c.icon className="h-6 w-6" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
} 