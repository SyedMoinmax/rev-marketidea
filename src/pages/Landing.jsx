import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Zap, Star, ArrowRight, CheckCircle, MapPin, 
  Building2, Wrench, Car, Briefcase, Monitor, Heart,
  TrendingUp, Users, Award, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { icon: Building2, label: "Real Estate", count: "1,240+" },
  { icon: Wrench, label: "Home Services", count: "3,580+" },
  { icon: Car, label: "Automotive", count: "890+" },
  { icon: Briefcase, label: "Professional", count: "2,100+" },
  { icon: Monitor, label: "Technology", count: "1,760+" },
  { icon: Heart, label: "Personal", count: "980+" },
];

const stats = [
  { value: "50,000+", label: "Requests Matched" },
  { value: "12,000+", label: "Verified Professionals" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "4.8/5", label: "Average Rating" },
];

const steps = [
  { n: "01", title: "Submit Your Request", desc: "Describe what you need with your budget and timeline. Takes 2 minutes." },
  { n: "02", title: "Professionals Compete", desc: "Verified professionals review your request and submit competitive offers." },
  { n: "03", title: "AI Validates Offers", desc: "Every offer is analyzed for market fairness, scope quality, and pricing." },
  { n: "04", title: "You Choose the Best", desc: "Compare AI-scored offers and hire the best professional for your needs." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">OfferMatch</span>
            <Badge variant="outline" className="text-xs hidden sm:flex">Canada</Badge>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
            <Link to="/professionals" className="hover:text-foreground transition-colors">For Professionals</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="bg-accent text-accent-foreground border-0 mb-6 px-4 py-1.5 text-sm font-medium">
                🇨🇦 Canada's AI-Powered Reverse Marketplace
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6">
                Professionals Compete
                <span className="block text-primary">For Your Business</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Submit one request. Receive multiple AI-validated offers from verified professionals. 
                Every offer is scored for fairness so you always get the best deal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 h-12 text-base font-semibold w-full sm:w-auto">
                    Post a Request Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/professionals">
                  <Button size="lg" variant="outline" className="px-8 h-12 text-base font-semibold w-full sm:w-auto border-border">
                    Join as Professional
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free to post</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> AI-validated offers</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> Canada-wide</span>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
                <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How OfferMatch Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A smarter way to find and hire professionals across Canada
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="relative bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="text-4xl font-bold text-primary/20 mb-4">{step.n}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-border z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Validation Feature */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground border-0 mb-4">AI-Powered Engine</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Every Offer Is Validated Before You See It
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our AI analyzes every offer against real Canadian market data, professional reputation, 
                and industry standards — so you only see fair, competitive proposals.
              </p>
              <div className="space-y-4">
                {[
                  { color: "bg-green-500", status: "Green — Competitive", desc: "Price aligned with market, good scope, realistic timeline" },
                  { color: "bg-yellow-500", status: "Yellow — Needs Attention", desc: "Specific recommendations provided, professional can revise" },
                  { color: "bg-red-500", status: "Red — Blocked", desc: "Excessively overpriced or incomplete — prevented from reaching you" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-secondary/40 rounded-xl">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${item.color}`} />
                    <div>
                      <div className="font-semibold text-foreground text-sm">{item.status}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">AI Validation Report</span>
                <Badge className="ml-auto bg-green-100 text-green-800">Green</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                Competitive market offer. Price is within 5% of Toronto average for home renovation services.
              </div>
              <div className="space-y-3">
                {[
                  { label: "Price Score", value: 91, color: "bg-green-500" },
                  { label: "Quality Score", value: 87, color: "bg-blue-500" },
                  { label: "Reputation Score", value: 94, color: "bg-purple-500" },
                  { label: "Market Alignment", value: 89, color: "bg-primary" },
                ].map((score, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{score.label}</span>
                      <span className="font-semibold text-foreground">{score.value}/100</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${score.color} rounded-full`} style={{ width: `${score.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span className="text-2xl font-bold text-primary">90<span className="text-base text-muted-foreground">/100</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">All Service Categories</h2>
            <p className="text-muted-foreground">Find professionals across every industry in Canada</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link to="/dashboard" key={i}>
                <motion.div whileHover={{ scale: 1.02 }} className="bg-card rounded-2xl p-5 border border-border text-center cursor-pointer hover:border-primary/40 hover:shadow-md transition-all">
                  <cat.icon className="w-7 h-7 text-primary mx-auto mb-3" />
                  <div className="font-semibold text-foreground text-sm mb-1">{cat.label}</div>
                  <div className="text-xs text-muted-foreground">{cat.count} pros</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Built for Trust</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">Every professional on OfferMatch goes through rigorous verification</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Identity Verified", desc: "Government ID and business registration checked by our team" },
              { icon: Star, title: "Performance Tracked", desc: "AI monitors offer quality, response time, and customer satisfaction" },
              { icon: Award, title: "Trust Badges", desc: "Verified professionals earn trust badges visible on every offer" },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-card rounded-2xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Better Offers?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of Canadians who get fair, AI-validated offers every day.</p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-10 h-12 text-base font-semibold">
              Post Your Request Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">OfferMatch Canada</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 OfferMatch Canada Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}