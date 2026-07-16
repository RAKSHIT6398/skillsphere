import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'Gig Marketplace', to: '/gigs' },
        { label: 'How it Works', to: '/#how-it-works' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Blog', to: '/blog' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Careers', to: '/careers' },
        { label: 'Press', to: '/press' },
        { label: 'Contact', to: '/contact' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', to: '/help' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'FAQ', to: '/faq' },
      ]
    },
  ];

  const socialLinks = [
    { icon: '𝕏', label: 'Twitter', href: '#' },
    { icon: 'in', label: 'LinkedIn', href: '#' },
    { icon: 'f', label: 'Facebook', href: '#' },
    { icon: '▶', label: 'YouTube', href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                             justify-center shadow-lg">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-white font-bold text-xl">SkillSphere</span>
            </Link>

            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              India ka #1 intelligent hyperlocal freelance ecosystem.
              AI-powered matching se sahi kaam aur sahi freelancer connect hota hai.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center
                             justify-center text-gray-400 hover:bg-blue-600
                             hover:text-white transition-all duration-200
                             font-bold text-sm"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-center space-x-2">
                <span>📧</span>
                <a
                  href="mailto:support@skillsphere.in"
                  className="hover:text-white transition-colors"
                >
                  support@skillsphere.in
                </a>
              </p>
              <p className="flex items-center space-x-2">
                <span>📞</span>
                <a
                  href="tel:+911234567890"
                  className="hover:text-white transition-colors"
                >
                  +91 12345 67890
                </a>
              </p>
              <p className="flex items-center space-x-2">
                <span>📍</span>
                <span>Mumbai, Maharashtra, India</span>
              </p>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase
                             tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm hover:text-white hover:translate-x-1
                                 inline-block transition-all duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center
                          justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1">
                📬 Newsletter Subscribe Karo
              </h4>
              <p className="text-sm text-gray-500">
                Latest jobs aur tips seedhe inbox mein pao
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="aapka@email.com"
                className="flex-1 md:w-64 bg-gray-800 border border-gray-700
                           text-white rounded-l-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-blue-500
                           placeholder-gray-500"
              />
              <button
                className="bg-blue-600 text-white px-5 py-2.5 rounded-r-lg
                           text-sm font-medium hover:bg-blue-700
                           transition-colors whitespace-nowrap"
              >
                Subscribe →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center
                          justify-between gap-3 text-sm">
            <p>
              © {currentYear} SkillSphere. Sab rights reserved.
              Made with ❤️ in India 🇮🇳
            </p>
            <div className="flex items-center space-x-4">
              <Link
                to="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full
                               animate-pulse inline-block" />
                <span className="text-green-400">All systems normal</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;