import { NextResponse } from 'next/server';
import { connectDB } from '@/app/config/db';
import Category from '@/app/models/category';
import { adminMiddleware } from '../middleware/admin.middleware';

export async function GET() {
    await connectDB();
    const categories = await Category.find();
    return NextResponse.json(categories, { status: 200 });
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const adminCheck = await adminMiddleware(req as any);
        if (adminCheck instanceof NextResponse) {
            return adminCheck;
        }
        const body = await req.json();
        const { name } = body;
        if (!name) {
            return NextResponse.json({ message: "Category name is required" }, { status: 400 });
        }
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return NextResponse.json({ message: "Category already exists" }, { status: 400 });
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        return NextResponse.json({ message: "Category created successfully" }, { status: 201 });
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
        const body = await req.json();
        const { name } = body;
        if (!name) {
            return NextResponse.json({ message: "Category name is required" }, { status: 400 });
        }
        const deletedCategory = await Category.findOneAndDelete({ name });
        if (!deletedCategory) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
