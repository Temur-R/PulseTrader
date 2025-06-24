import React, { useState, useEffect } from 'react';
import { TrendingUp, Bell, Shield, Zap, Users, Star, ArrowRight, Play, Menu, X } from 'lucide-react';

export default function StockPulseHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({ users: 0, alerts: 0, stocks: 0 });

  // Animate numbers on load
  useEffect(() => {
    const targets = { users: 50000, alerts: 2500000, stocks: 8500 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedNumbers({
        users: Math.floor(targets.users * progress),
        alerts: Math.floor(targets.alerts * progress),
        stocks: Math.floor(targets.stocks * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedNumbers(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Day Trader",
      content: "StockPulse has completely transformed how I monitor my portfolio. The instant alerts have saved me thousands.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Investment Advisor",
      content: "My clients love the clean interface and reliable notifications. It's become an essential tool in our workflow.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Retail Investor",
      content: "Finally, a stock app that doesn't overwhelm me with features I don't need. Simple, powerful, perfect.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">StockPulse</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">Reviews</a>
              <button className="text-gray-300 hover:text-white transition-colors">Sign In</button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800 border-t border-cyan-500/20">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Pricing</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Reviews</a>
                <button className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white">Sign In</button>
                <button className="block w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Never Miss a 
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Market Move</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Get instant alerts when your stocks hit target prices. Stay ahead of the market with real-time notifications that matter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors group">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="text-lg">Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                {animatedNumbers.users.toLocaleString()}+
              </div>
              <div className="text-gray-300 text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                {animatedNumbers.alerts.toLocaleString()}+
              </div>
              <div className="text-gray-300 text-lg">Alerts Sent</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                {animatedNumbers.stocks.toLocaleString()}+
              </div>
              <div className="text-gray-300 text-lg">Stocks Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to Stay <span className="text-cyan-400">Informed</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our powerful platform combines real-time data with intelligent alerts to keep you ahead of market movements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Alerts</h3>
              <p className="text-gray-300">Get notified instantly when stocks hit your target prices via email, SMS, or push notifications.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Data</h3>
              <p className="text-gray-300">Access live market data with minimal delay. Never miss a crucial moment in the market.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure & Reliable</h3>
              <p className="text-gray-300">Bank-level security with 99.9% uptime. Your data and alerts are always protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-cyan-400">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300">See what our users are saying about StockPulse</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-cyan-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Portfolio?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of investors who never miss an opportunity with StockPulse.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-all duration-200 transform hover:scale-105">
            Start Your Free Trial
          </button>
          <p className="text-gray-400 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-cyan-500/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StockPulse</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-center text-gray-400">
            <p>&copy; 2025 StockPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}