import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import {
  Shield, Zap, Star, ArrowRight, CheckCircle, MapPin,
  Building2, Wrench, Car, Briefcase, Monitor, Heart,
  Award, TrendingUp, Users, Sparkles, ChevronRight
} from "lucide-react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target.replace(/\D/g, ""));
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Floating orb ──────────────────────────────────────────────────────────────
function Orb({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const categories = [
  { icon: Building2, label: "Real Estate",      gradient: "from-violet-500 to-purple-600" },
  { icon: Wrench,    label: "Home Services",     gradient: "from-blue-500 to-cyan-500" },
  { icon: Car,       label: "Automotive",        gradient: "from-emerald-500 to-teal-500" },
  { icon: Briefcase, label: "Professional",      gradient: "from-orange-500 to-amber-500" },
  { icon: Monitor,   label: "Technology",        gradient: "from-pink-500 to-rose-500" },
  { icon: Heart,     label: "Personal",          gradient: "from-indigo-500 to-blue-500" },
];

const steps = [
  { n: "01", title: "Submit Your Request",    desc: "Describe your need, budget & timeline in under 2 minutes.", icon: "📋", color: "from-violet-600 to-purple-600" },
  { n: "02", title: "Professionals Compete",  desc: "Verified pros review your request and submit competitive offers.", icon: "🏆", color: "from-blue-600 to-cyan-600" },
  { n: "03", title: "AI Validates Offers",    desc: "Every offer is scored for market fairness & quality.", icon: "🤖", color: "from-emerald-600 to-teal-600" },
  { n: "04", title: "You Choose the Best",    desc: "Compare AI-scored offers and hire with confidence.", icon: "✅", color: "from-orange-600 to-amber-600" },
];

export default function Landing() {
  const [requests, setRequests] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.entities.CustomerRequest.filter({ status: "active", is_public: true }, "-created_date", 6)
      .then(setRequests).catch(() => {});
    base44.entities.ServiceCategory.filter({ is_active: true }, "sort_order", 10)
      .then(setCategoryData).catch(() => {});
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    if (currentUser.role === "admin") return "/admin";
    if (currentUser.role === "professional") return "/browse-requests";
    return "/dashboard";
  };

  const displayCategories = categoryData.length > 0
    ? categoryData.slice(0, 6).map((c, i) => ({ ...categories[i % categories.length], label: c.name }))
    : categories;

  return (
    <div className="min-h-screen bg-[#050810] text-white font-body overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#050810]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Reverse Marketplace
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#live-requests" className="hover:text-white transition-colors">Live Requests</a>
          </div>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20 font-semibold">
                    {currentUser.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Button>
                </Link>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer" onClick={() => window.location.href = "/profile"}>
                  {currentUser.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/20 font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background orbs */}
        <Orb className="w-[600px] h-[600px] bg-violet-600 -top-40 -left-40" />
        <Orb className="w-[500px] h-[500px] bg-blue-600 top-20 -right-60" />
        <Orb className="w-[400px] h-[400px] bg-cyan-500 bottom-0 left-1/2" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              🇨🇦 Canada's AI-Powered Reverse Marketplace — Live 2026
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Professionals
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Compete For You
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Post one request. Receive AI-validated offers from verified professionals.
              Every proposal is scored for fairness — so you always win.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  Post a Request Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-base hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center backdrop-blur-sm"
                >
                  Join as Professional
                </motion.button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Free to post</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /> AI-validated offers</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-400" /> Canada-wide</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { value: "50000", suffix: "+", label: "Requests Matched" },
              { value: "12000", suffix: "+", label: "Verified Professionals" },
              { value: "98",    suffix: "%", label: "Customer Satisfaction" },
              { value: "4.8",   suffix: "/5", label: "Average Rating" },
            ].map((s, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
                <div className="relative text-3xl font-extrabold bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent mb-1">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="relative text-sm text-white/40">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Four Steps to a{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Perfect Match
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              A smarter way to find and hire professionals across Canada
            </p>
          </div>

          <div className="hidden lg:flex items-stretch gap-0">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative group p-7 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden flex-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className="text-4xl mb-5">{step.icon}</div>
                  <div className={`text-5xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3 leading-none`}>
                    {step.n}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </motion.div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="flex items-center justify-center px-1 flex-shrink-0 self-center">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Mobile/tablet: simple grid without arrows */}
          <div className="grid md:grid-cols-2 gap-6 lg:hidden">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative group p-7 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="text-4xl mb-5">{step.icon}</div>
                <div className={`text-5xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3 leading-none`}>
                  {step.n}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI VALIDATION ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <Orb className="w-[500px] h-[500px] bg-violet-700 right-0 top-0" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-5">AI-Powered Engine</Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Every Offer Is{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Validated
                </span>{" "}
                Before You See It
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed text-lg">
                Our AI analyzes every offer against real Canadian market data, professional reputation,
                and industry standards — so you only see fair, competitive proposals.
              </p>
              <div className="space-y-3">
                {[
                  { color: "from-emerald-500 to-green-500",  dot: "bg-emerald-400", status: "🟢 Green — Competitive",      desc: "Price aligned with market, solid scope, realistic timeline" },
                  { color: "from-amber-500 to-yellow-500",  dot: "bg-amber-400",   status: "🟡 Yellow — Needs Attention", desc: "AI provides specific recommendations for the professional to revise" },
                  { color: "from-red-500 to-rose-500",      dot: "bg-red-400",     status: "🔴 Red — Blocked",            desc: "Excessively overpriced or incomplete — never reaches your inbox" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.dot}`} />
                    <div>
                      <div className="font-semibold text-white text-sm">{item.status}</div>
                      <div className="text-sm text-white/40 mt-0.5">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Validation Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/5" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">AI Validation Report</span>
                    <span className="ml-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      ✓ GREEN
                    </span>
                  </div>
                  <div className="text-sm text-emerald-300/80 mb-6 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    Competitive market offer. Price is within 5% of Toronto average for home renovation services.
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Price Score",      value: 91, color: "from-emerald-500 to-green-400" },
                      { label: "Quality Score",    value: 87, color: "from-blue-500 to-cyan-400" },
                      { label: "Reputation Score", value: 94, color: "from-violet-500 to-purple-400" },
                      { label: "Market Alignment", value: 89, color: "from-orange-500 to-amber-400" },
                    ].map((score, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-white/50">{score.label}</span>
                          <span className="font-bold text-white">{score.value}<span className="text-white/30">/100</span></span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: `${score.value}%` }}
                            viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${score.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm text-white/40">Overall Score</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                      90<span className="text-base text-white/30">/100</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE REQUESTS ── */}
      {requests.length > 0 && (
        <section id="live-requests" className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-2" />
                Live Requests
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                Active Requests{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Right Now</span>
              </h2>
              <p className="text-white/40">Real requests from customers waiting for your offer</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/20">
                        {req.category_name || "Service"}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        req.priority === "urgent" ? "bg-red-500/20 text-red-400" :
                        req.priority === "high"   ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/10 text-white/40"
                      }`}>
                        {req.priority || "medium"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-snug">{req.title}</h3>
                    <p className="text-xs text-white/30 mb-4 line-clamp-2 leading-relaxed">{req.description}</p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.city}, {req.province}
                      </span>
                      {req.budget_max && (
                        <span className="font-semibold text-white/60">
                          ${req.budget_min?.toLocaleString()} – ${req.budget_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                  View All Requests <ArrowRight className="inline w-4 h-4 ml-2" />
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <Orb className="w-[400px] h-[400px] bg-blue-700 left-0 top-20" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 mb-4">Categories</Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">All Service Categories</h2>
            <p className="text-white/40">Find professionals across every industry in Canada</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map((cat, i) => (
              <Link to="/dashboard" key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 text-center cursor-pointer transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-white text-sm">{cat.label}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 mb-5">Trust & Safety</Badge>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Built for Trust</h2>
          <p className="text-white/40 mb-14 max-w-xl mx-auto">Every professional goes through rigorous verification before they can submit offers</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Identity Verified",     desc: "Government ID and business registration checked by our team",  gradient: "from-violet-500 to-purple-600" },
              { icon: Star,   title: "Performance Tracked",   desc: "AI monitors offer quality, response time, and customer satisfaction", gradient: "from-blue-500 to-cyan-600" },
              { icon: Award,  title: "Trust Badges",          desc: "Verified pros earn badges visible on every offer they submit", gradient: "from-emerald-500 to-teal-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <Orb className="w-[600px] h-[600px] bg-violet-600 left-1/2 -translate-x-1/2 -translate-y-1/4" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
              Ready to Get{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Better Offers?
              </span>
            </h2>
            <p className="text-white/40 mb-10 text-lg">
              Join thousands of Canadians who get fair, AI-validated offers every day.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/60 transition-all duration-300"
              >
                Post Your Request Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white/80">Reverse Marketplace</span>
          </div>
          <p className="text-sm text-white/20">© 2026 Reverse Marketplace Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}