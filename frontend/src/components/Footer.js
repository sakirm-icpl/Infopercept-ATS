import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';
import InfoperceptLogo from './InfoperceptLogo';

const Footer = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark';

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Support', href: '#contact' },
        { name: 'Documentation', href: '#docs' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Internal Use', href: '#internal' },
        { name: 'HR Department', href: '#hr' },
        { name: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#help' },
        { name: 'User Guide', href: '#guide' },
        { name: 'Technical Support', href: '#tech' },
        { name: 'Privacy Policy', href: '#privacy' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'GitHub', icon: Github, href: 'https://github.com' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'hr-support@infopercept.com', href: 'mailto:hr-support@infopercept.com' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: MapPin, text: 'Internal HR Department', href: '#' }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`${isDark ? 'bg-black/20 backdrop-blur-md border-t border-white/20' : 'bg-gray-900 text-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <InfoperceptLogo 
              size="md" 
              variant="default" 
              showText={true} 
              textColor={isDark ? "text-white" : "text-white"} 
            />
            <p className="mt-4 text-sm text-gray-300 max-w-md">
              Internal HR platform for streamlined recruitment processes. 
              Built for internal use to manage hiring efficiently and securely.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.href}
                    className={`flex items-center text-sm ${isDark ? 'text-blue-200 hover:text-white' : 'text-gray-300 hover:text-white'} transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    {contact.text}
                  </a>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollToSection(link.href.replace('#', ''))}
                      className={`text-sm ${isDark ? 'text-blue-200 hover:text-white' : 'text-gray-300 hover:text-white'} transition-colors text-left`}
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 Infopercept Internal HR Platform. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Internal Use Only</span>
              <span>•</span>
              <span>HR Department</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 