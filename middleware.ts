import { NextRequest, NextResponse } from "next/server"

function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

function adminMiddleware(request: NextRequest) {
  const role = request.cookies.get("role")

  if (role?.value !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/")) {
    const authResult = authMiddleware(request)
    if (authResult) return authResult
  }

    if (pathname.startsWith("/dashboard")) {
        const adminResult = adminMiddleware(request)
        if (adminResult) return adminResult
    }
    


  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/","/dashboard/:path*","/favorites/"],
}
