import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET as string;

type JwtPayload = {
  id: string;
  email: string;
  role: string;
};

export function adminMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    return decoded;

  } catch {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }
}