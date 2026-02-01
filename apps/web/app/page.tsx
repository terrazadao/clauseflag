"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Zap,
  FileText,
  BrainCircuit,
  DollarSign,
  Lock,
  CheckCircle,
} from "lucide-react";

type Language = 'en' | 'hi';

interface Translation {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    price: string;
  };
  trust: {
    usedBy: string;
    fast: string;
    simple: string;
    ai: string;
  };
  fear: {
    heading: string;
    examples: { title: string; icon: React.ReactNode }[];
  };
  howItWorks: {
    heading: string;
    steps: { title: string; desc: string }[];
  };
  pricing: {
    heading: string;
    price: string;
    perScan: string;
    noSub: string;
  };
  legal: string;
  footer: {
    privacy: string;
    terms: string;
    contact: string;
    copyright: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    hero: {
      headline: "Spot Risky Contract Clauses in 60 Seconds",
      subheadline: "No legal jargon. Just clear red flags before you sign.",
      cta: "Scan Your Contract",
      price: "₹800 / $10"
    },
    trust: {
      usedBy: "Used by 500+ founders and freelancers",
      fast: "Fast (<60s)",
      simple: "Plain Language",
      ai: "Smart Analysis"
    },
    fear: {
      heading: "What Could Go Wrong?",
      examples: [
        { title: "Auto-renewal clauses that trap you for years", icon: <Lock className="w-6 h-6 text-red-600" /> },
        { title: "Liability terms that could cost you $100K+", icon: <DollarSign className="w-6 h-6 text-red-600" /> },
        { title: "IP ownership clauses that steal your work", icon: <FileText className="w-6 h-6 text-red-600" /> }
      ]
    },
    howItWorks: {
      heading: "How It Works",
      steps: [
        { title: "Upload your contract", desc: "PDF or DOCX supported" },
        { title: "AI scans for risks", desc: "Checks for 8 high-risk clause types" },
        { title: "Get clear explanations", desc: "Plain language results in 60 seconds" }
      ]
    },
    pricing: {
      heading: "Simple Pay-As-You-Go",
      price: "₹800 / $10",
      perScan: "per contract scan",
      noSub: "No subscription required"
    },
    legal: "⚠️ This tool provides information only and does not constitute legal advice. Always consult a qualified lawyer for important contracts.",
    footer: {
      privacy: "Privacy Policy",
      terms: "Terms",
      contact: "Contact",
      copyright: "© 2024 ClauseFlag. All rights reserved."
    }
  },
  hi: {
    hero: {
      headline: "60 सेकंड में खतरनाक अनुबंध खंड खोजें",
      subheadline: "कोई कानूनी शब्दजाल नहीं। साइन करने से पहले सिर्फ स्पष्ट चेतावनियां।",
      cta: "अपना अनुबंध स्कैन करें",
      price: "₹800"
    },
    trust: {
      usedBy: "500+ founders और freelancers द्वारा उपयोग किया गया",
      fast: "तेज़ (60 सेकंड से कम)",
      simple: "सरल भाषा",
      ai: "स्मार्ट विश्लेषण"
    },
    fear: {
      heading: "क्या गलत हो सकता है?",
      examples: [
        { title: "ऑटो-रिन्यूअल क्लॉज जो आपको सालों तक फंसा सकते हैं", icon: <Lock className="w-6 h-6 text-red-600" /> },
        { title: "देयता शर्तें जो आपको ₹80 लाख+ खर्च करवा सकती हैं", icon: <DollarSign className="w-6 h-6 text-red-600" /> },
        { title: "IP स्वामित्व क्लॉज जो आपका काम चुरा सकते हैं", icon: <FileText className="w-6 h-6 text-red-600" /> }
      ]
    },
    howItWorks: {
      heading: "यह कैसे काम करता है",
      steps: [
        { title: "अपना अनुबंध अपलोड करें", desc: "PDF या DOCX" },
        { title: "AI जोखिमों को स्कैन करता है", desc: "8 उच्च जोखिम वाले क्लॉज प्रकारों की जाँच" },
        { title: "स्पष्ट स्पष्टीकरण प्राप्त करें", desc: "60 सेकंड में सरल भाषा में परिणाम" }
      ]
    },
    pricing: {
      heading: "उपयोग के अनुसार भुगतान करें",
      price: "₹800",
      perScan: "प्रति अनुबंध स्कैन",
      noSub: "कोई सदस्यता की आवश्यकता नहीं"
    },
    legal: "⚠️ यह टूल केवल जानकारी प्रदान करता है और कानूनी सलाह नहीं है। महत्वपूर्ण अनुबंधों के लिए हमेशा एक योग्य वकील से परामर्श लें।",
    footer: {
      privacy: "गोपनीयता नीति",
      terms: "शर्तें",
      contact: "संपर्क करें",
      copyright: "© 2024 ClauseFlag. सर्वाधिकार सुरक्षित।"
    }
  }
};

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  // Use a state for t to ensure hydration compatibility, or just use efficient non-SSR logic. 
  // Simplified for speed: default to 'en' then effect updates it.
  useEffect(() => {
    const saved = localStorage.getItem('clauseflag_lang') as Language;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setLang(saved);
  }, []);

  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('clauseflag_lang', newLang);
  };

  // Avoid hydration mismatch by waiting for mount to show locale-specific content if needed, 
  // or just render default english first (which matches server) then switch. 
  // For this simple landing page, we'll accept the quick flash or just render.

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚩</span>
              <span className="font-bold text-xl tracking-tight text-blue-900">ClauseFlag</span>
            </div>
            <button
              onClick={toggleLang}
              className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {lang === 'en' ? '🇮🇳 हिंदी' : '🇺🇸 EN'}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-block p-2 bg-blue-50 rounded-2xl mb-4">
              <ShieldAlert className="w-12 h-12 text-blue-600 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-blue-900 leading-tight">
              {t.hero.headline}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subheadline}
            </p>

            <div className="pt-8">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-transform hover:scale-105 shadow-xl shadow-blue-200 flex items-center gap-2 mx-auto">
                <Zap className="w-5 h-5 fill-current" />
                {t.hero.cta} - {t.hero.price}
              </button>
            </div>
          </motion.div>
        </section>

        {/* Trust Signals */}
        <section className="pb-16 px-4 bg-gray-50/50">
          <div className="max-w-6xl mx-auto text-center border-y border-gray-100 py-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-8">{t.trust.usedBy}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: t.trust.fast, icon: Zap, color: "text-amber-500" },
                { label: t.trust.simple, icon: FileText, color: "text-blue-500" },
                { label: t.trust.ai, icon: BrainCircuit, color: "text-purple-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-semibold text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fear Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-blue-900">{t.fear.heading}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {t.fear.examples.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-red-50/50 border border-red-100 hover:border-red-200 transition-all text-center"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <p className="font-medium text-lg text-gray-800 leading-snug">{item.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4 bg-blue-900 text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">{t.howItWorks.heading}</h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-blue-500/30" />

              {t.howItWorks.steps.map((step, i) => (
                <div key={i} className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-4 border-blue-900 shadow-lg">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-blue-200">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-gray-500 mb-4">{t.pricing.heading}</h3>
            <div className="text-5xl font-black text-blue-900 mb-4">{t.pricing.price}</div>
            <p className="text-gray-500 mb-8">{t.pricing.perScan}</p>
            <ul className="space-y-4 mb-8 text-left max-w-xs mx-auto">
              <li className="flex gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{t.pricing.noSub}</span>
              </li>
              <li className="flex gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>PDF & DOCX Support</span>
              </li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              {t.hero.cta}
            </button>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg text-sm text-gray-600 text-center leading-relaxed">
            {t.legal}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="hover:text-blue-600 transition-colors">{t.footer.privacy}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.footer.terms}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.footer.contact}</a>
        </div>
        <p>{t.footer.copyright}</p>
      </footer>
    </div>
  );
}
