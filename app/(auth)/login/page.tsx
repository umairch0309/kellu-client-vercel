"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormData) => {
    setServerError("");

    const { data, error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setServerError(error.message ?? "Invalid email or password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    const role = data?.user?.role;
    router.push(role === "SUPER_ADMIN" ? "/admin" : "/");
  };

  const fillCredentials = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: false });
    setValue("password", password, { shouldValidate: false });
  };

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
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-neutral-dark/70 mb-6">
            Sign in to your account
          </p>

          {serverError && (
            <div
              className="mb-4 p-3 rounded-lg"
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
              }}
            >
              <p className="text-sm" style={{ color: "#dc2626" }}>
                {serverError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-400"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50"
                  size={18}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-400"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>
                  {errors.password.message}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link
                  href="/login/forgot-password"
                  className="text-sm font-medium"
                  style={{ color: "#28AFB0" }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#28AFB0", color: "#ffffff" }}
            >
              <FiLogIn size={18} />
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Test Credentials Box */}
        <div
          className="mt-4 rounded-lg p-4 border"
          style={{ backgroundColor: "#F9FAFB", borderColor: "#EAEBED" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: "#1F271B", opacity: 0.5 }}
          >
            Test credentials
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Admin */}
            <button
              type="button"
              onClick={() => fillCredentials("test@admin.com", "12345678")}
              className="text-left p-3 rounded-lg border transition-colors hover:border-[#28AFB0] hover:bg-white group"
              style={{ borderColor: "#EAEBED", backgroundColor: "white" }}
            >
              <p
                className="text-xs font-semibold mb-1.5"
                style={{ color: "#28AFB0" }}
              >
                Admin login
              </p>
              <p className="text-xs" style={{ color: "#1F271B", opacity: 0.7 }}>
                test@admin.com
              </p>
              <p className="text-xs" style={{ color: "#1F271B", opacity: 0.7 }}>
                12345678
              </p>
            </button>

            {/* Business */}
            <button
              type="button"
              onClick={() => fillCredentials("test@business.com", "12345678")}
              className="text-left p-3 rounded-lg border transition-colors hover:border-[#28AFB0] hover:bg-white group"
              style={{ borderColor: "#EAEBED", backgroundColor: "white" }}
            >
              <p
                className="text-xs font-semibold mb-1.5"
                style={{ color: "#28AFB0" }}
              >
                Business login
              </p>
              <p className="text-xs" style={{ color: "#1F271B", opacity: 0.7 }}>
                test@business.com
              </p>
              <p className="text-xs" style={{ color: "#1F271B", opacity: 0.7 }}>
                12345678
              </p>
            </button>
          </div>
          <p
            className="text-xs mt-2.5 text-center"
            style={{ color: "#1F271B", opacity: 0.4 }}
          >
            Click a card to auto-fill the form
          </p>
        </div>
      </div>
    </div>
  );
}