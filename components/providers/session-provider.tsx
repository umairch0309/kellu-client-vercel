"use client";

import { authClient } from "@/lib/auth-client";
import { createContext, useContext } from "react";

type Session = typeof authClient.$Infer.Session;

const SessionContext = createContext<{
  session: Session | null;
  isPending: boolean;
}>({ session: null, isPending: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <SessionContext.Provider value={{ session: session ?? null, isPending }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useAppSession = () => useContext(SessionContext);