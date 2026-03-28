import { connectDB } from "@/app/config/db";
import Product from "@/app/models/products";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import slugify from "slugify";
import "@/app/models/category";  
import mongoose from "mongoose";


export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Price filter
    if (searchParams.get("minPrice")) {
      filter.price = { ...filter.price, $gte: Number(searchParams.get("minPrice")) };
    }
    if (searchParams.get("maxPrice")) {
      filter.price = { ...filter.price, $lte: Number(searchParams.get("maxPrice")) };
    }


    if (searchParams.get("categories")) {
      const categoryIds = searchParams.get("categories")?.split(",");
      filter.category = { $in: categoryIds };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: products,
      pagination: { total, page, limit, totalPages },
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const countInStock = formData.get("countInStock") as string;
    const images = formData.getAll("images") as File[];


    if (!name || !price || !description || !category || images.length === 0) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }


    const uploadPromises = images.map(async (img) => {
      const buffer = Buffer.from(await img.arrayBuffer());

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      return result;
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url);


    const product = await Product.create({
      name,
      price: Number(price),
      description,
      category,
      images: urls,
      countInStock: Number(countInStock) || 0,
      slug: slugify(name, { lower: true }),
    });


    await product.populate('category');
    

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
