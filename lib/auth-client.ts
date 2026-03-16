import { createAuthClient } from "better-auth/react";

console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
export const authClient = createAuthClient({
  baseURL: "http://localhost:8000", // points to your backend
  fetchOptions: {
    credentials: "include", // CRITICAL for cross-origin cookies
  },
});

// Named exports for convenience
export const { signIn, signOut, signUp, useSession } = authClient;
