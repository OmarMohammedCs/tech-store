import { connectDB } from "@/app/config/db";
import User from "@/app/models/users";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { adminMiddleware } from "../middleware/admin.middleware";

export async function POST(req: Request) {
  try {
    await connectDB();
    const adminCheck = await adminMiddleware(req as any);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = new User({
      name,
      email,
      password,
      userName: slugify(`${name}-${Date.now().toString().slice(-5)}`, { lower: true }),
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().select("-password");
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const adminCheck = await adminMiddleware(req as any);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

        if (email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({ message: "Cannot delete admin user" }, { status: 400 });
    }

    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const adminCheck = await adminMiddleware(req as any);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }
    const { email, name, password, avatarBase64 } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const updatedData: Partial<{ name: string; password: string; avatar: string }> = {};
    if (name) updatedData.name = name;
    if (password) updatedData.password = password;


    if (avatarBase64) {
      const uploadResult = await cloudinary.uploader.upload(avatarBase64, {
        folder: "avatars",
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      });
      updatedData.avatar = uploadResult.secure_url;
    }

    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
