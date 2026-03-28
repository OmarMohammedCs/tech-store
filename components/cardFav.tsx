"use client";

import axios from "axios";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProductItem = {
  _id: string;
  name?: string;
  slug?: string;
  category?: string;
  images?: string[];
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
  product: {
    _id: string;
    product: ProductItem;
    createdAt?: string;
    updatedAt?: string;
  };
  onDelete?: (id: string) => void; 
};

export default function Card({ product, onDelete }: Props) {
  if (!product?.product) return null;

  const { product: prod } = product;
  const imageSrc = prod.images?.length ? prod.images[0] : "/placeholder.jpg";
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!prod._id) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/rating", {
          params: { product: prod._id },
        });
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [prod._id]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onDelete) onDelete(prod._id);
  };

  return (
    <div className="w-64 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 relative overflow-hidden">
      
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs p-1.5 rounded-full hover:bg-red-600 transition cursor-pointer"
      >
        <Trash2 size={18} />
      </button>

      {/* Image */}
      <Link href={`/products/${prod.slug}`}>
        <div className="relative h-[180px] w-full cursor-pointer overflow-hidden rounded-t-2xl">
          <Image
            src={imageSrc}
            alt={prod.name || "product"}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
          {prod.name}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"
              }`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {averageRating} ({reviews.length})
          </span>
        </div>
      </div>
    </div>
  );
}
