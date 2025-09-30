import { SignIn } from '@clerk/nextjs'
import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TimeTracker</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Sign in to continue tracking your time
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200',
                  card: 'shadow-none border-0 bg-transparent',
                  headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white mb-2',
                  headerSubtitle: 'text-gray-600 dark:text-gray-400 mb-6',
                  socialButtonsBlockButton: 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200',
                  formFieldInput: 'border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
                  identityPreviewText: 'text-gray-600 dark:text-gray-400',
                  formFieldLabel: 'text-gray-700 dark:text-gray-300 font-medium',
                  dividerLine: 'bg-gray-200 dark:bg-gray-600',
                  dividerText: 'text-gray-500 dark:text-gray-400',
                  formFieldSuccessText: 'text-green-600 dark:text-green-400',
                  formFieldErrorText: 'text-red-600 dark:text-red-400',
                  alertText: 'text-red-600 dark:text-red-400',
                }
              }}
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
