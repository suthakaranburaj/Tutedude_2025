import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Code, Users, Zap, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Street Food Supply Connect
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Our mission is to bring transparency, trust, and growth to the street food ecosystem by connecting vendors, suppliers, and users on a single digital platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Code className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Modern Tech Stack
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Built with Next.js 14, Tailwind CSS, and Material-UI. This template 
                provides a solid foundation for modern web applications with the latest 
                technologies and best practices.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verified & Trusted Connections
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We ensure that every supplier and vendor on our platform is verified, so you can source and sell with confidence.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-yellow-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Fast & Transparent Sourcing
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform makes it easy for vendors to find suppliers, compare prices, and place orders quickly and transparently.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Community Driven
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We are building a supportive community where vendors and suppliers can share feedback, grow together, and support each other.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Street Food Supply Connect?
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                <strong>Transparency:</strong> Every transaction, profile, and review is open and clear, so you always know who you’re working with.
              </p>
              <p>
                <strong>Empowerment:</strong> We give vendors and suppliers the tools they need to succeed, from order management to analytics.
              </p>
              <p>
                <strong>Community:</strong> Our platform is built for and by the street food community. Your feedback shapes our future.
              </p>
              <p>
                <strong>Growth:</strong> We help local businesses grow by making sourcing easier, cheaper, and more reliable.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 