import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/app/clients/_components/ClientProviders";

export const metadata: Metadata = {
  title: "Kellu - Business Management Platform",
  description: "Manage your business operations efficiently",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body suppressHydrationWarning>
          <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
