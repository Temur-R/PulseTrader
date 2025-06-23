import React, { useState } from 'react';
import { TrendingUp, Check, X, Star, Zap, Shield, Bell, BarChart3, Users, Smartphone, Mail, Phone, Menu, ArrowRight } from 'lucide-react';

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StockPulse</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#" className="text-cyan-400 font-medium">Pricing</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
            <button className="text-gray-300 hover:text-white transition-colors">Sign In</button>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
              Get Started
            </button>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-cyan-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Features</a>
              <a href="#" className="block px-3 py-2 text-cyan-400 font-medium">Pricing</a>
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">About</a>
              <a href="#" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Contact</a>
              <button className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white">Sign In</button>
              <button className="block w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Pricing Card Component
const PricingCard = ({ plan, isPopular }) => {
  const iconMap = {
    'Basic': Bell,
    'Pro': Zap,
    'Enterprise': Shield
  };
  
  const Icon = iconMap[plan.name] || Bell;

  return (
    <div className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-200 hover:scale-105 ${
      isPopular 
        ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20' 
        : 'border-cyan-500/20 hover:border-cyan-500/40'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
          isPopular 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
            : 'bg-slate-700'
        }`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-gray-400 ml-2">/month</span>
        </div>
        {plan.originalPrice && (
          <div className="text-gray-500 line-through text-sm mt-1">
            ${plan.originalPrice}/month
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
        
        {plan.notIncluded && plan.notIncluded.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-500">{feature}</span>
          </div>
        ))}
      </div>

      <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
        isPopular
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transform hover:scale-105'
          : 'bg-slate-700 hover:bg-slate-600 text-white'
      }`}>
        {plan.buttonText}
      </button>
    </div>
  );
};

// FAQ Component
const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "How do the stock alerts work?",
      answer: "Our system monitors real-time stock prices and sends instant notifications via email, SMS, or push notifications when your target prices are reached. You can set multiple alerts per stock and customize notification preferences."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your subscription will remain active until the end of your current billing period."
    },
    {
      question: "What exchanges do you support?",
      answer: "We support major exchanges including NYSE, NASDAQ, AMEX, and several international exchanges. Our Basic plan covers US markets, while Pro and Enterprise plans include international markets."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes, we have mobile apps for both iOS and Android. The apps include all the features of our web platform plus additional mobile-specific features like location-based alerts."
    },
    {
      question: "How accurate are the price alerts?",
      answer: "Our alerts are triggered by real-time market data with minimal delay (typically under 1 second). We use multiple data sources to ensure accuracy and reliability."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all plans. If you're not satisfied with our service, contact our support team for a full refund."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg">
            <button
              onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
              className="w-full text-left p-6 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <div className={`transform transition-transform ${openQuestion === index ? 'rotate-45' : ''}`}>
                  <div className="w-6 h-6 text-cyan-400">+</div>
                </div>
              </div>
            </button>
            {openQuestion === index && (
              <div className="px-6 pb-6">
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Pricing Page Component
export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individual investors',
      price: billingPeriod === 'monthly' ? 9 : 90,
      originalPrice: billingPeriod === 'monthly' ? null : 108,
      features: [
        'Up to 10 stock alerts',
        'Email notifications',
        'Basic portfolio tracking',
        'Mobile app access',
        'US markets only'
      ],
      notIncluded: [
        'SMS notifications',
        'International markets',
        'Advanced analytics'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Pro',
      description: 'Ideal for active traders',
      price: billingPeriod === 'monthly' ? 29 : 290,
      originalPrice: billingPeriod === 'monthly' ? null : 348,
      features: [
        'Unlimited stock alerts',
        'Email + SMS notifications',
        'Advanced portfolio analytics',
        'International markets',
        'Price prediction insights',
        'Custom alert conditions',
        'Priority support'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'For teams and institutions',
      price: billingPeriod === 'monthly' ? 99 : 990,
      originalPrice: billingPeriod === 'monthly' ? null : 1188,
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'White-label solutions',
        'Advanced security features',
        'Custom reporting'
      ],
      buttonText: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent <span className="text-cyan-400">Pricing</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your investment needs. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PricingCard 
                key={plan.name} 
                plan={plan} 
                isPopular={index === 1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Compare All Features</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-white font-semibold">Features</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Basic</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Pro</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-t border-slate-600">
                    <td className="py-4 px-6">Stock Alerts</td>
                    <td className="text-center py-4 px-6">Up to 10</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="py-4 px-6">Email Notifications</td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="py-4 px-6">SMS Notifications</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="py-4 px-6">International Markets</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-slate-600">
                    <td className="py-4 px-6">API Access</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FAQ />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Free Trial?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of investors who trust StockPulse for their market alerts.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto">
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-400 text-sm mt-4">No credit card required • Cancel anytime</p>
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