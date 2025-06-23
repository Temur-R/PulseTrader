import React, { useState } from 'react';
import { Check, X, Bell, Zap, Shield, LucideIcon } from 'lucide-react';

interface Plan {
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  notIncluded?: string[];
}

interface PricingCardProps {
  plan: Plan;
  isPopular: boolean;
}

const pricingTiers: Plan[] = [
  {
    name: 'Basic',
    price: 9.99,
    description: 'Perfect for beginners starting their investment journey',
    features: [
      'Real-time stock quotes',
      'Basic stock analysis',
      'Up to 5 stock alerts',
      'Daily market insights',
      'Email notifications'
    ],
    buttonText: 'Start Free Trial'
  },
  {
    name: 'Pro',
    price: 24.99,
    description: 'For active traders who need advanced features',
    features: [
      'Everything in Basic',
      'Advanced technical analysis',
      'Unlimited stock alerts',
      'Portfolio optimization',
      'Priority email support',
      'Real-time market news',
      'Custom watchlists'
    ],
    isPopular: true,
    buttonText: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: 49.99,
    description: 'Full suite of professional trading tools',
    features: [
      'Everything in Pro',
      'API access',
      'Custom analytics',
      'Dedicated account manager',
      'Advanced data exports',
      'Team collaboration tools',
      'Custom integrations',
      '24/7 priority support'
    ],
    buttonText: 'Contact Sales'
  }
];

// Pricing Card Component
const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular }) => {
  const iconMap: Record<string, LucideIcon> = {
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
        {plan.features.map((feature: string, index: number) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
        
        {plan.notIncluded && plan.notIncluded.map((feature: string, index: number) => (
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
const FAQ: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

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
const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans: Plan[] = [
    {
      name: 'Basic',
      description: 'Perfect for individual investors',
      price: billingPeriod === 'monthly' ? 9 : 90,
      originalPrice: billingPeriod === 'monthly' ? null : 108,
      features: [
        'Up to 10 stock alerts',
        'Real-time stock quotes',
        'Basic technical analysis',
        'Email notifications',
        'Market news feed'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Pro',
      description: 'For active traders and professionals',
      price: billingPeriod === 'monthly' ? 29 : 290,
      originalPrice: billingPeriod === 'monthly' ? null : 348,
      features: [
        'Unlimited stock alerts',
        'Advanced technical analysis',
        'SMS & push notifications',
        'Portfolio tracking',
        'Custom watchlists',
        'Priority support',
        'API access'
      ],
      buttonText: 'Start Free Trial',
      isPopular: true
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations',
      price: billingPeriod === 'monthly' ? 99 : 990,
      originalPrice: billingPeriod === 'monthly' ? null : 1188,
      features: [
        'Everything in Pro',
        'Multiple user accounts',
        'Team collaboration tools',
        'Custom integrations',
        'Dedicated account manager',
        'Training sessions',
        'SLA guarantees'
      ],
      buttonText: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Trading Edge
          </h1>
          <p className="text-xl text-gray-400">
            Select the plan that best fits your trading strategy
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-slate-800/50 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-cyan-400">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={!!plan.isPopular}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <FAQ />
      </div>
    </div>
  );
};

export default PricingPage; 