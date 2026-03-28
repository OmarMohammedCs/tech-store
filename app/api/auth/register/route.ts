import { connectDB } from "@/app/config/db";
import User from "@/app/models/users";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const userExista = await User.findOne({ email });
        if (userExista) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }
        const newUser = new User({ name, email, password , userName: slugify(`${name}-${Date.now().toString().slice(-5)}`,{lower:true}) });
        await newUser.save();
        const token = signToken({
  id: newUser._id,
  email: newUser.email,
});

        const res =  NextResponse.json({ message: "User registered successfully", token }, { status: 201 });
        res.cookies.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
        return  res;
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}