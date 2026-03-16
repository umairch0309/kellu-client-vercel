'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Simulate sending reset email
    // In a real app, this would call an API
    setTimeout(() => {
      setSuccess(true)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo.png" 
            alt="Kellu" 
            width={200} 
            height={53}
            className="h-14 w-auto max-w-full"
            priority
          />
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-light">
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-neutral-dark mb-2">Reset Password</h1>
              <p className="text-sm text-neutral-dark/70 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-tertiary/20 border border-tertiary rounded-lg">
                  <p className="text-sm text-tertiary">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#28AFB0] text-white rounded-lg hover:bg-[#28AFB0]/90 transition-colors font-medium"
                >
                  Send Reset Link
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-secondary hover:text-secondary-dark font-medium inline-flex items-center gap-2"
                >
                  <FiArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <FiCheckCircle className="text-secondary" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-neutral-dark mb-2">Check Your Email</h1>
                <p className="text-sm text-neutral-dark/70 mb-6">
                  We've sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
                <p className="text-xs text-neutral-dark/60 mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="w-full py-3 border border-neutral-light text-neutral-dark rounded-lg hover:bg-neutral-light transition-colors font-medium"
                >
                  Try Another Email
                </button>
                <Link
                  href="/login"
                  className="block w-full py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <FiArrowLeft size={18} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
