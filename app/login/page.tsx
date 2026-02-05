'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Dummy credentials
    const dummyEmail = 'admin@kellu.com'
    const dummyPassword = 'password123'
    
    if (email === dummyEmail && password === dummyPassword) {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/')
    } else {
      setError('Invalid email or password. Use: admin@kellu.com / password123')
    }
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

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-light">
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Welcome Back</h1>
          <p className="text-sm text-neutral-dark/70 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-tertiary/20 border border-tertiary rounded-lg">
              <p className="text-sm text-tertiary">{error}</p>
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
              {/* Forgot Password Link */}
              <div className="mt-2 text-right">
                <Link
                  href="/login/forgot-password"
                  className="text-sm text-secondary hover:text-secondary-dark font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FiLogIn size={18} />
              Sign In
            </button>
          </form>

          {/* Dummy Credentials Hint */}
          <div className="mt-6 p-4 bg-neutral-light rounded-lg">
            <p className="text-xs text-neutral-dark/70 mb-2 font-semibold">Demo Credentials:</p>
            <p className="text-xs text-neutral-dark/70">Email: <span className="font-mono font-semibold">admin@kellu.com</span></p>
            <p className="text-xs text-neutral-dark/70">Password: <span className="font-mono font-semibold">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

