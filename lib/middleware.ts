import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value || null;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        verifyToken(token);
        return NextResponse.next();
    } catch (error) {
          return NextResponse.redirect(new URL("/login", req.url));
    }

}