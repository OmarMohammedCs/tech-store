import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import users from "@/app/models/users";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userData = session.user;


  let user = await users.findOne({ email: userData.email });

if (!user) {
  const name = userData.name || `User${Date.now()}`;
  const userName = name.replace(/\s/g, "").toLowerCase();

  user = new users({
    name,
    email: userData.email || `user${Date.now()}@example.com`,
    avatar: userData.image || "",
    role: "user",
    password: Math.random().toString(36).slice(-8),
    userName: userName, 
  });

  await user.save();
}


  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    userName: user.userName,
  });


  const response = NextResponse.json(
    {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        userName: user.userName,
      },
    },
    { status: 200 }
  );


  response.cookies.set("role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}