"use client";

import api from "@/app/servise/api";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  name?: string;
  category?: Category;
  images?: string[];
  slug?: string;
  price?: number;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  user?: {
    name?: string;
    avatar?: string;
  };
};

type Props = {
  product: Product;
};

export default function Card({ product }: Props) {
  if (!product) return null;

  const imageSrc = product.images?.length ? product.images[0] : "/placeholder.jpg";

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!product._id) return;

    const fetchReviews = async () => {
      try {
        const res = await api.rating.getAll(product._id);
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [product._id]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="w-64 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 relative overflow-hidden">
        <div className="relative h-[180px] w-full overflow-hidden rounded-t-xl">
          <Image
            src={imageSrc}
            alt={product.name || "product"}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-blue-600 uppercase">{product.category?.name}</p>

          <h2 className="text-sm font-semibold text-gray-800 line-clamp-1 mt-1">{product.name}</h2>

          <div className="flex items-center gap-1 text-sm">
            {Number(averageRating) > 0 ? (
              [...Array(Math.round(Number(averageRating)))].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))
            ) : (
              <span className="text-gray-400">No rating yet</span>
            )}
            <span className="ml-2 text-blue-500">({reviews.length} Reviews)</span>
          </div>

          <p className="mt-3 text-lg font-bold text-gray-600">EGP{" "}{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
