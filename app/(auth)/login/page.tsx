'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'
import { authClient } from '@/lib/auth-client' // 👈 ADD THIS

// 👇 REMOVE the entire CREDENTIALS array

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false) // 👈 ADD THIS

  const handleLogin = async (e: React.FormEvent) => { // 👈 make async
    e.preventDefault()
    setIsLoading(true)  // 👈 ADD
    setError('')         // 👈 ADD (clear previous errors)

    const { data, error } = await authClient.signIn.email({  // 👈 REPLACE old logic
      email,
      password,
    })

    if (error) {
      setError(error.message ?? 'Invalid email or password.')
      setIsLoading(false)
      return
    }

    // Redirect based on user role returned from backend
    const role = data?.user?.role  // adjust this field to match your backend's response
    router.push(role === 'admin' ? '/admin' : '/')
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
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

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-light">
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Welcome Back</h1>
          <p className="text-sm text-neutral-dark/70 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-2">
                Email
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mt-2 text-right">
                <Link href="/login/forgot-password" className="text-sm font-medium" style={{ color: '#28AFB0' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading} // 👈 ADD
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" // 👈 add disabled styles
              style={{ backgroundColor: '#28AFB0', color: '#ffffff' }}
            >
              <FiLogIn size={18} />
              {isLoading ? 'Signing in...' : 'Sign In'} {/* 👈 ADD */}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-neutral-dark/70">
            Don&apos;t have an account?{' '}
            <Link href="/login/signup" className="font-semibold hover:underline" style={{ color: '#28AFB0' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}