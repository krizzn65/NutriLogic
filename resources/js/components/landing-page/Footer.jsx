'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { assets } from '../../assets/assets';

const footerLinks = [
  {
    label: 'Navigasi',
    links: [
      { title: 'Home', id: 'Home' },
      { title: 'About', id: 'About' },
      { title: 'Data', id: 'Problem' },
      { title: 'Fitur', id: 'Fitur' },
      { title: 'Penggunaan', id: 'Penggunaan' },
      { title: 'Contact', id: 'Contact' },
    ],
  },
  {
    label: 'Kontak',
    links: [
      { title: 'nutrilogic@posyandu.id', href: 'mailto:nutrilogic@posyandu.id', icon: Mail },
      { title: '+62 896-5690-5302', href: 'tel:+6289656905302', icon: Phone },
      { title: 'Jember, Indonesia', href: '#', icon: MapPin },
    ],
  },
  {
    label: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'FAQ', href: '/faq' },
    ],

  },
];

const handleNavClick = (id) => {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export function Footer() {
  return (
    <footer
      className="relative w-full bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 px-6 md:px-[150px] lg:px-[230px] py-16 lg:py-20 font-montserrat">
      {/* Decorative gradient line */}
      <div
        className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#00BFEF] to-transparent blur-sm" />

      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Branding Section */}
          <AnimatedContainer className="space-y-6 lg:col-span-1">
            <div className="flex items-center">
              <img src={assets.logo} alt="NutriLogic Logo" className="h-8 w-auto" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              Sistem Pemantauan Gizi Balita Berbasis AI untuk Indonesia yang lebih sehat dan bebas stunting.
            </p>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} NutriLogic. All rights reserved.
            </p>
          </AnimatedContainer>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-2">
            {footerLinks.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">{section.label}</h3>
                  <ul className="space-y-3 text-sm">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        {link.id ? (
                          <button
                            onClick={() => handleNavClick(link.id)}
                            className="inline-flex items-center text-gray-600 hover:text-[#00BFEF] transition-colors duration-300 group cursor-pointer">
                            {link.icon && <link.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                            <span className="group-hover:translate-x-0.5 transition-transform">{link.title}</span>
                          </button>
                        ) : (
                          <a
                            href={link.href}
                            className="inline-flex items-center text-gray-600 hover:text-[#00BFEF] transition-colors duration-300 group">
                            {link.icon && <link.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                            <span className="group-hover:translate-x-0.5 transition-transform">{link.title}</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <AnimatedContainer delay={0.5}>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Dikembangkan dengan ❤️ untuk Indonesia yang lebih sehat
              </p>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  );
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default Footer;
