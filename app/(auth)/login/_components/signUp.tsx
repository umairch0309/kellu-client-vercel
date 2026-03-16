"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiMail,
  FiLock,
  FiUser,
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";
import { authClient } from "@/lib/auth-client";

type Step = "details" | "verify";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /\d/.test(password) },
    { label: "One special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;

  const barColor =
    score <= 1
      ? "#ef4444"
      : score === 2
        ? "#ff8630"
        : score === 3
          ? "#eab308"
          : "#22c55e";

  const label =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong";

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? barColor : "#e5e7eb" }}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs font-medium" style={{ color: barColor }}>
        {label}
      </p>

      {/* Checklist */}
      <ul className="space-y-1">
        {checks.map(({ label, pass }) => (
          <li
            key={label}
            className="flex items-center gap-2 text-xs transition-colors duration-200"
            style={{ color: pass ? "#16a34a" : "#9ca3af" }}
          >
            <FiCheck size={12} strokeWidth={pass ? 3 : 1.5} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Submit */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/", 
      });

      if (signUpError) {
        setError(
          signUpError.message ?? "Something went wrong. Please try again.",
        );
      } else {
        setStep("verify");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Verify screen */
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
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

          <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-light text-center">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#EEF2FF" }}
            >
              <FiMail size={28} style={{ color: "#2B50AA" }} />
            </div>

            <h1 className="text-2xl font-bold text-neutral-dark mb-2">
              Check your inbox
            </h1>
            <p className="text-sm text-neutral-dark/70 mb-1">
              We sent a verification link to
            </p>
            <p className="text-sm font-semibold text-neutral-dark mb-6 break-all">
              {email}
            </p>

            <p className="text-xs text-neutral-dark/50 mb-6">
              Click the link in the email to verify your account. You may need
              to check your spam folder.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2B50AA", color: "#ffffff" }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Sign-up form */
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

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-neutral-light">
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">
            Create an Account
          </h1>
          <p className="text-sm text-neutral-dark/70 mb-6">
            Sign up to get started with Kellu
          </p>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg"
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
              }}
            >
              <p className="text-sm" style={{ color: "#dc2626" }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 hover:text-neutral-dark/70 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 hover:text-neutral-dark/70 transition-colors"
                >
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <p
                  className="mt-1 text-xs font-medium"
                  style={{
                    color: confirmPassword === password ? "#16a34a" : "#ef4444",
                  }}
                >
                  {confirmPassword === password
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#28AFB0", color: "#ffffff" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>
                  <FiUserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign-in link */}
          <p className="mt-6 text-center text-sm text-neutral-dark/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: "#28AFB0" }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
