import { connectDB } from "@/app/config/db";
import Product from "@/app/models/products";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const id = params.id;

    const body = await req.json();

    const updateData: any = {};

    if (body.countInStock !== undefined) {
      updateData.countInStock = Number(body.countInStock);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json(product);

  } catch (err) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    await connectDB();

   
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

 
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (url: string) => {
        try {
          const publicId = url.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      });
      await Promise.all(deletePromises);
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}