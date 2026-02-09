"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Zap,
  FileText,
  BrainCircuit,
  DollarSign,
  Lock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ContractUpload from "@/components/ContractUpload";
import Payment from "@/components/PaymentFixed";
import AnalysisResults from "@/components/AnalysisResults";
import { AnalysisResult } from "@clauseflag/shared";
import { useSupabase } from "@/hooks/useSupabase";

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
    legal: "This tool provides information only and does not constitute legal advice. Always consult a qualified lawyer for important contracts.",
    footer: {
      privacy: "Privacy Policy",
      terms: "Terms",
      contact: "Contact",
      copyright: "\u00a9 2024 ClauseFlag. All rights reserved."
    }
  },
  hi: {
    hero: {
      headline: "60 \u0938\u0947\u0915\u0902\u0921 \u092e\u0947\u0902 \u0916\u0924\u0930\u0928\u093e\u0915 \u0905\u0928\u0941\u092c\u0902\u0927 \u0916\u0902\u0921 \u0916\u094b\u091c\u0947\u0902",
      subheadline: "\u0915\u094b\u0908 \u0915\u093e\u0928\u0942\u0928\u0940 \u0936\u092c\u094d\u0926\u091c\u093e\u0932 \u0928\u0939\u0940\u0902\u0964 \u0938\u093e\u0907\u0928 \u0915\u0930\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0938\u093f\u0930\u094d\u092b \u0938\u094d\u092a\u0937\u094d\u091f \u091a\u0947\u0924\u093e\u0935\u0928\u093f\u092f\u093e\u0902\u0964",
      cta: "\u0905\u092a\u0928\u093e \u0905\u0928\u0941\u092c\u0902\u0927 \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902",
      price: "\u20b9800"
    },
    trust: {
      usedBy: "500+ founders \u0914\u0930 freelancers \u0926\u094d\u0935\u093e\u0930\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u093f\u092f\u093e \u0917\u092f\u093e",
      fast: "\u0924\u0947\u091c\u093c (60 \u0938\u0947\u0915\u0902\u0921 \u0938\u0947 \u0915\u092e)",
      simple: "\u0938\u0930\u0932 \u092d\u093e\u0937\u093e",
      ai: "\u0938\u094d\u092e\u093e\u0930\u094d\u091f \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923"
    },
    fear: {
      heading: "\u0915\u094d\u092f\u093e \u0917\u0932\u0924 \u0939\u094b \u0938\u0915\u0924\u093e \u0939\u0948?",
      examples: [
        { title: "\u0911\u091f\u094b-\u0930\u093f\u0928\u094d\u092f\u0942\u0905\u0932 \u0915\u094d\u0932\u0949\u091c \u091c\u094b \u0906\u092a\u0915\u094b \u0938\u093e\u0932\u094b\u0902 \u0924\u0915 \u092b\u0902\u0938\u093e \u0938\u0915\u0924\u0947 \u0939\u0948\u0902", icon: <Lock className="w-6 h-6 text-red-600" /> },
        { title: "\u0926\u0947\u092f\u0924\u093e \u0936\u0930\u094d\u0924\u0947\u0902 \u091c\u094b \u0906\u092a\u0915\u094b \u20b980 \u0932\u093e\u0916+ \u0916\u0930\u094d\u091a \u0915\u0930\u0935\u093e \u0938\u0915\u0924\u0940 \u0939\u0948\u0902", icon: <DollarSign className="w-6 h-6 text-red-600" /> },
        { title: "IP \u0938\u094d\u0935\u093e\u092e\u093f\u0924\u094d\u0935 \u0915\u094d\u0932\u0949\u091c \u091c\u094b \u0906\u092a\u0915\u093e \u0915\u093e\u092e \u091a\u0941\u0930\u093e \u0938\u0915\u0924\u0947 \u0939\u0948\u0902", icon: <FileText className="w-6 h-6 text-red-600" /> }
      ]
    },
    howItWorks: {
      heading: "\u092f\u0939 \u0915\u0948\u0938\u0947 \u0915\u093e\u092e \u0915\u0930\u0924\u093e \u0939\u0948",
      steps: [
        { title: "\u0905\u092a\u0928\u093e \u0905\u0928\u0941\u092c\u0902\u0927 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902", desc: "PDF \u092f\u093e DOCX" },
        { title: "AI \u091c\u094b\u0916\u093f\u092e\u094b\u0902 \u0915\u094b \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0924\u093e \u0939\u0948", desc: "8 \u0909\u091a\u094d\u091a \u091c\u094b\u0916\u093f\u092e \u0935\u093e\u0932\u0947 \u0915\u094d\u0932\u0949\u091c \u092a\u094d\u0930\u0915\u093e\u0930\u094b\u0902 \u0915\u0940 \u091c\u093e\u0901\u091a" },
        { title: "\u0938\u094d\u092a\u0937\u094d\u091f \u0938\u094d\u092a\u0937\u094d\u091f\u0940\u0915\u0930\u0923 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0915\u0930\u0947\u0902", desc: "60 \u0938\u0947\u0915\u0902\u0921 \u092e\u0947\u0902 \u0938\u0930\u0932 \u092d\u093e\u0937\u093e \u092e\u0947\u0902 \u092a\u0930\u093f\u0923\u093e\u092e" }
      ]
    },
    pricing: {
      heading: "\u0909\u092a\u092f\u094b\u0917 \u0915\u0947 \u0905\u0928\u0941\u0938\u093e\u0930 \u092d\u0941\u0917\u0924\u093e\u0928 \u0915\u0930\u0947\u0902",
      price: "\u20b9800",
      perScan: "\u092a\u094d\u0930\u0924\u093f \u0905\u0928\u0941\u092c\u0902\u0927 \u0938\u094d\u0915\u0948\u0928",
      noSub: "\u0915\u094b\u0908 \u0938\u0926\u0938\u094d\u092f\u0924\u093e \u0915\u0940 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e \u0928\u0939\u0940\u0902"
    },
    legal: "\u092f\u0939 \u091f\u0942\u0932 \u0915\u0947\u0935\u0932 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u092a\u094d\u0930\u0926\u093e\u0928 \u0915\u0930\u0924\u093e \u0939\u0948 \u0914\u0930 \u0915\u093e\u0928\u0942\u0928\u0940 \u0938\u0932\u093e\u0939 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u092e\u0939\u0924\u094d\u0935\u092a\u0942\u0930\u094d\u0923 \u0905\u0928\u0941\u092c\u0902\u0927\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u0939\u092e\u0947\u0936\u093e \u090f\u0915 \u092f\u094b\u0917\u094d\u092f \u0935\u0915\u0940\u0932 \u0938\u0947 \u092a\u0930\u093e\u092e\u0930\u094d\u0936 \u0932\u0947\u0902\u0964",
    footer: {
      privacy: "\u0917\u094b\u092a\u0928\u0940\u092f\u0924\u093e \u0928\u0940\u0924\u093f",
      terms: "\u0936\u0930\u094d\u0924\u0947\u0902",
      contact: "\u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902",
      copyright: "\u00a9 2024 ClauseFlag. \u0938\u0930\u094d\u0935\u093e\u0927\u093f\u0915\u093e\u0930 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924\u0964"
    }
  }
};

type AppStep = 'landing' | 'upload' | 'analyzing' | 'payment' | 'results';

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [step, setStep] = useState<AppStep>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const uploadRef = useRef<HTMLDivElement>(null);
  const { user, supabase } = useSupabase();

  useEffect(() => {
    const saved = localStorage.getItem('clauseflag_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('clauseflag_lang', newLang);
  };

  const handleScanClick = () => {
    setStep('upload');
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalyzeError('');
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setAnalyzeError('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setStep('analyzing');
    setAnalyzeError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('jurisdiction', 'IN');
      formData.append('language', lang);

      const headers: Record<string, string> = {};
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Analysis failed');
      }

      setAnalysisResult(data.data);
      setStep('payment');
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('upload');
    }
  };

  const handlePaymentComplete = () => {
    setStep('results');
  };

  const handleRestart = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setAnalyzeError('');
    setStep('upload');
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('landing')}>
              <img src="/01_Logo_Horizontal_Primary.png" alt="ClauseFlag Logo" className="h-20 w-auto max-w-xs" />

            </div>
            <button
              onClick={toggleLang}
              className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {lang === 'en' ? '\u{1F1EE}\u{1F1F3} \u0939\u093f\u0902\u0926\u0940' : '\u{1F1FA}\u{1F1F8} EN'}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Show analysis flow if not on landing */}
        {step === 'analyzing' && (
          <section className="py-20 px-4 text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <h2 className="text-2xl font-bold text-blue-900">
                {lang === 'en' ? 'Analyzing your contract...' : '\u0906\u092a\u0915\u0947 \u0905\u0928\u0941\u092c\u0902\u0927 \u0915\u093e \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...'}
              </h2>
              <p className="text-gray-600">
                {lang === 'en' ? 'AI is scanning for risky clauses. This takes about 60 seconds.' : 'AI \u091c\u094b\u0916\u093f\u092e \u0935\u093e\u0932\u0947 \u0916\u0902\u0921\u094b\u0902 \u0915\u094b \u0938\u094d\u0915\u0948\u0928 \u0915\u0930 \u0930\u0939\u093e \u0939\u0948\u0964'}
              </p>
            </motion.div>
          </section>
        )}

        {step === 'payment' && analysisResult && (
          <Payment result={analysisResult} onPaymentComplete={handlePaymentComplete} />
        )}

        {step === 'results' && analysisResult && (
          <AnalysisResults result={analysisResult} onRestart={handleRestart} />
        )}

        {(step === 'landing' || step === 'upload') && (
          <>
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
                  <button
                    onClick={handleScanClick}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-transform hover:scale-105 shadow-xl shadow-blue-200 flex items-center gap-2 mx-auto"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    {t.hero.cta} - {t.hero.price}
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Upload Section (shown after clicking CTA) */}
            {step === 'upload' && (
              <section ref={uploadRef} className="py-16 px-4 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-center text-blue-900">
                    {lang === 'en' ? 'Upload Your Contract' : '\u0905\u092a\u0928\u093e \u0905\u0928\u0941\u092c\u0902\u0927 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902'}
                  </h2>

                  <ContractUpload
                    language={lang}
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    error={analyzeError}
                  />

                  {selectedFile && (
                    <button
                      onClick={handleAnalyze}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <BrainCircuit className="w-5 h-5" />
                      {lang === 'en' ? 'Analyze Contract' : '\u0905\u0928\u0941\u092c\u0902\u0927 \u0915\u093e \u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0930\u0947\u0902'} - {t.hero.price}
                    </button>
                  )}
                </motion.div>
              </section>
            )}

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
                <button
                  onClick={handleScanClick}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
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
          </>
        )}
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
