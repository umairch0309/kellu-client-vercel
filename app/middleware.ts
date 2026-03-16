
import { betterFetch } from "better-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"], // add all routes you want to protect
};

