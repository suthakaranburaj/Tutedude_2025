'use client'

import { useState } from 'react'
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Palette, 
  Database, 
  Code, 
  Users, 
  Rocket,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export function Features() {
  const [activeTab, setActiveTab] = useState(0)

  const features = [
    {
      id: 0,
      title: 'Verified Supplier Listings',
      description: 'Browse and connect with trusted, verified suppliers for all your raw material needs.',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      features: [
        'Verified supplier profiles',
        'Transparent pricing',
        'Supplier ratings & reviews',
        'Direct contact options',
        'Location-based search',
        'Quality assurance'
      ]
    },
    {
      id: 1,
      title: 'Vendor Empowerment',
      description: 'Tools and resources for street food vendors to source materials affordably and reliably.',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Easy vendor registration',
        'Bulk order requests',
        'Order tracking',
        'Supplier comparison',
        'Community support',
        'Growth analytics'
      ]
    },
    {
      id: 2,
      title: 'Transparent Transactions',
      description: 'Clear, fair, and secure transactions between vendors and suppliers.',
      icon: Zap,
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Order history',
        'Secure payments',
        'Dispute resolution',
        'Real-time notifications',
        'Digital receipts',
        'Support for local languages'
      ]
    },
    {
      id: 3,
      title: 'Community & Support',
      description: 'A growing network of vendors and suppliers supporting each other.',
      icon: Users,
      color: 'from-orange-500 to-red-600',
      features: [
        'Vendor-supplier chat',
        'Help center',
        'Workshops & resources',
        'Feedback system',
        'Growth stories',
        'Local events'
      ]
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              build trust & grow
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform brings together street food vendors and suppliers, making sourcing transparent, affordable, and reliable for everyone.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Tab Navigation */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(index)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                    activeTab === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                      activeTab === index 
                        ? 'text-blue-500 transform translate-x-1' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feature Content */}
          <div className="lg:pl-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeTab].color} flex items-center justify-center shadow-lg mr-4`}>
                  {(() => {
                    const Icon = features[activeTab].icon
                    return <Icon className="w-8 h-8 text-white" />
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {features[activeTab].title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {features[activeTab].description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features[activeTab].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ready to join our platform?
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Connect with vendors & suppliers today
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Rocket className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            More ways we support your business
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: 'Smart Inventory Management',
                description: 'Track your inventory, orders, and supplier relationships in one place',
                color: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Smartphone,
                title: 'Mobile-First Experience',
                description: 'Access the platform from anywhere - perfect for vendors on the go',
                color: 'from-indigo-500 to-purple-600'
              },
              {
                icon: Users,
                title: 'Community Network',
                description: 'Connect with other vendors and suppliers in your local area',
                color: 'from-pink-500 to-rose-600'
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
} 