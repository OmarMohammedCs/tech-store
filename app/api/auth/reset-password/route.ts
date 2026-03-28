import { NextResponse } from "next/server";
import { connectDB } from "@/app/config/db";
import User from "@/app/models/users";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    console.log("Received token and password for reset:", { token, password });

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === "string") {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = decoded as JwtPayload;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { password: hashedPassword, failedLoginAttempts: 0 },
    { new: true }
  );

    await updatedUser.save();

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
