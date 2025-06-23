import React from 'react';
import { TrendingUp, ArrowRight, Bell, Zap, Shield, Star } from 'lucide-react';

interface HomepageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onSignIn, onGetStarted }) => {
  const animatedNumbers = {
    users: 10000,
    alerts: 500000,
    stocks: 5000
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Day Trader",
      rating: 5,
      content: "StockPulse has completely transformed how I monitor my investments. The real-time alerts are a game-changer."
    },
    {
      name: "Michael Chen",
      role: "Investment Analyst",
      rating: 5,
      content: "The most reliable stock monitoring tool I've used. The accuracy and speed of alerts are exceptional."
    },
    {
      name: "Emily Rodriguez",
      role: "Portfolio Manager",
      rating: 5,
      content: "Essential tool for any serious investor. The customization options and user interface are outstanding."
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
              Real-Time Stock Monitoring<br />Made Simple
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track your favorite stocks, get instant alerts, and make informed decisions with our powerful stock monitoring platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 ml-2" />
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
      <section id="testimonials" className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by <span className="text-cyan-400">Traders</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied traders who trust PulseTrader for their market monitoring needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">{testimonial.content}</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-cyan-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join PulseTrader today and experience the power of intelligent stock monitoring.
            </p>
            <button onClick={onGetStarted} className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-gray-100">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-cyan-500/20 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
            <span className="text-white font-bold text-lg">PulseTrader</span>
          </div>
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#top" className="text-gray-400 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-cyan-400 transition-colors">Pricing</a>
          </div>
          <div className="text-gray-500 text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} PulseTrader™. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};