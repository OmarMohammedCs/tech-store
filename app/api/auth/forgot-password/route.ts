import { connectDB } from "@/app/config/db";
import User from "@/app/models/users";
import { signToken } from "@/lib/jwt";
import sendEmail from "@/lib/sendEmail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    console.log("Received email for password reset:", email);
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User found for password reset:", user.email);

    const token = signToken(
      { id: user._id.toString() },
      { expiresIn: "15m" }
    );

    console.log("Generated reset token:", token);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const message = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetUrl}">Reset Password</a>
      </p>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail({
      email,
      subject: "Password Reset",
      message,
    });

    console.log("Password reset email sent to:", email);

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
