import { NextRequest, NextResponse } from "next/server";

interface Session {
  user: {
    role: string;
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    const session: Session | null = response.ok ? await response.json() : null;

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = session.user.role;
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isBusinessOwner = role === "BUSINESS_OWNER";

    // Unknown role → back to login
    if (!isSuperAdmin && !isBusinessOwner) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Business owner trying to access /admin → redirect to /
    if (pathname.startsWith("/admin") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Super admin trying to access / → redirect to /admin
    if (pathname === "/" && isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};