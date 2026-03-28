"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

import MainLayout from "@/app/mainLayout";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import { useCart } from "@/app/context/CartContext";

import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import {
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  Heart,
  HeartCrack,
  ZoomIn,
  ArrowRight,
  ArrowLeft,
  Star,
} from "lucide-react";
import axios from "axios";
import { Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/modal";
import { Textarea } from "@heroui/input";
import Loading from "@/components/loading";
import { api } from "@/app/servise/api";

interface Review {
  _id: string;
  user: { name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
  productId?: string;
}

type ProductType = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  countInStock: number;
  rating: number;
  numReviews: number;
  category?: { _id: string; name: string };
};

export default function ProductDetails() {
  const { addItem, cart } = useCart();
  const [count, setCount] = useState(1);
  const [selectImg, setSelectImg] = useState(0);
  const [selectShowImg, setSelectShowImg] = useState(0);
  const [activeHeart, setActiveHeart] = useState(false);
  const [productData, setProductData] = useState<ProductType | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    document.title = productData ? `${productData.name} - TechStore` : "TechStore - Product Details";
  }, [productData]);

   
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.products.getProductById(slug);
        setProductData(res.data);


        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") || [];
        setActiveHeart(favorites.includes(res.data._id));
      } catch (error) {
        console.error(error);
      }
    };
    fetchProduct();
  }, [slug]);

  const fetchReviews = async () => {
    try {
      if (!productData?._id) return;
      const res = await api.rating.getAll(productData._id);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmit = async () => {
    if (!productData?._id) return;

    if (!newReview.trim() || rating === 0) {
      toast.error("Please add a rating and comment");
      return;
    }

    try {
      const user = localStorage.getItem("user");
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { id: userId } = JSON.parse(user);

      const { data: review } = await api.rating.create({
        product: productData._id,
        rating,
        comment: newReview,
      });

      setReviews((prev) => [review, ...prev]);
      setNewReview("");
      setRating(0);

      toast.success("Review submitted successfully");
      fetchReviews();
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : "Something went wrong");
      toast.error(`Failed to submit review: ${message}`);
    }
  };


  useEffect(() => {
    if (productData?._id) {
      fetchReviews();
    }
  }, [productData?._id]);

  useEffect(() => {
    setSelectShowImg(selectImg);
  }, [selectImg]);



  const handleActiveHeart = async () => {
    if (!productData) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      if (activeHeart) {
        await api.favorites.delete(productData._id, user.id);

        toast.success("Removed from favorites");
      } else {

        await api.favorites.create({ product: productData._id, user: user.id });
        toast.success("Added to favorites");
      }


      setActiveHeart(!activeHeart);
    } catch (error: any) {
      console.error("Favorites error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };


  if (!productData) return <Loading />;

  const images = productData.images || [];
  const prevImg = () => setSelectShowImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImg = () => setSelectShowImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const Icon = activeHeart ? Heart : HeartCrack;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const handleAddToCart = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    if (!productData) return;
    const productForCart = {
      id: productData._id,
      name: productData.name,
      price: productData.price,
      img: images[selectImg],
      quantity: count,
    };
    if (count > productData.countInStock) {
      toast.error("Not enough stock");
      return;
    }
    await axios.put(`http://localhost:3000/api/products/edit/${productData._id}`, {
      countInStock: productData.countInStock - count
    });
    const existing = cart.find((item: any) => item.id === productForCart.id);
    if (existing) addItem({ ...productForCart, quantity: existing.quantity + count });
    else addItem(productForCart);
    toast.success(`${productData.name} added to cart`);
  };

  return (
    <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Products", productData.name]} />

    <div className="flex flex-col lg:flex-row gap-6 mt-6 px-4 lg:px-0">
        {/* Images */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="relative">
<div className="w-full max-w-md mx-auto lg:mx-0">
  <Image
    src={images[selectImg] || "/product.jpg"}
    alt={productData.name}
    width={600}
    height={600}
    className="w-full h-auto rounded-xl object-cover cursor-pointer"
    onClick={onOpen}
  />
</div>
            <ZoomIn className="absolute top-2 right-2 text-white bg-black/30 rounded-full p-1" size={28} />
          </div>

          <div className="w-full flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
            {images.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt="thumb"
                width={80}
                height={60}
                className={`cursor-pointer rounded-lg border-2 ${selectImg === i ? "border-blue-600" : "border-transparent"}`}
                onClick={() => setSelectImg(i)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-blue-600 font-bold uppercase">{productData.category?.name}</p>
            <p className={`flex items-center gap-1 text-sm ${productData.countInStock > 0 ? "text-green-600" : "text-red-600"}`}>
              {productData.countInStock > 0 ? <CheckCircle /> : <HeartCrack />}
              {productData.countInStock > 0 ? "In Stock " : "Out of Stock "}
            </p>
          </div>

          <h1 className="text-3xl font-bold">{productData.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            {Number(averageRating) > 0
              ? [...Array(Math.round(Number(averageRating)))].map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ★
                </span>
              ))
              : <span className="text-gray-400">No rating yet</span>}
            <span className="ml-2 text-blue-500">({reviews.length} Reviews)</span>
          </div>

          <p className="text-2xl font-semibold">${productData.price}</p>
          <p className="text-gray-400">{productData.description}</p>

          {/* Counter & Actions */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Button isIconOnly onPress={() => setCount((c) => c + 1)}>
                <Plus />
              </Button>
              <span className="font-semibold">{count}</span>
              <Button isIconOnly onPress={() => setCount((c) => Math.max(1, c - 1))}>
                <Minus />
              </Button>
            </div>

            <Button onPress={handleAddToCart}>
              <ShoppingBag className="mr-2" />
              Add to Cart
            </Button>

            <Button onClick={handleActiveHeart}>
              <Icon className={activeHeart ? "text-red-600" : "text-gray-600"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for Description & Reviews */}
      <Tabs className="mt-10">
        <Tab key="description" title="Description">
          <Card className="mt-4">
            <CardBody>{productData.description}</CardBody>
          </Card>
        </Tab>
        <Tab key="reviews" title={`Reviews (${reviews.length})`}>
          <Card className="mt-4 shadow-lg">
            <CardBody className="flex flex-col gap-4">
              {reviews.map((review, index) => (
                <Card key={index} className="bg-gray-50 dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <CardHeader className="flex gap-3 items-start pb-2">
                    <Avatar src={review.user?.avatar || "/product.jpg"} size="md" className="ring-2 ring-blue-500/20" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-md">{review.user?.name || "Anonymous"}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment || "No comment"}</p>
                  </CardBody>
                </Card>
              ))}
            </CardBody>

            {/* Add Review */}
            <CardFooter className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col gap-6 w-full">
              <p className="font-semibold text-xl w-full">Write Your Review</p>

              {/* Rating */}
              <div className="flex flex-col gap-3 w-full">
                <p className="text-sm text-gray-500">Rate this product:</p>
                <div className="flex items-center gap-2 w-full">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                            : "text-gray-300 dark:text-gray-600"
                        }
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-4 text-blue-600 dark:text-blue-400 font-medium">
                      You rated: {rating} star{rating > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex flex-col gap-3 w-full">
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  minRows={4}
                  className="w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  classNames={{
                    input: "text-base bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                    inputWrapper: "w-full",
                  }}
                />

                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all shadow-md"
                >
                  Submit Review
                </Button>
              </div>
            </CardFooter>

          </Card>
        </Tab>
      </Tabs>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-black/40">
        <ModalContent className="relative">
          {(onClose) => (
            <ModalBody>
              <Image src={images[selectShowImg] || "/product.jpg"} alt="Product image" width={600} height={600} className="w-full h-auto object-contain" />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button className="w-12 h-12 bg-gray-800 hover:bg-gray-600 rounded-full text-white flex items-center justify-center" onClick={prevImg}>
                  <ArrowLeft size={24} />
                </button>
                <button className="w-12 h-12 bg-gray-800 hover:bg-gray-600 rounded-full text-white flex items-center justify-center" onClick={nextImg}>
                  <ArrowRight size={24} />
                </button>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </MainLayout>
  );
}
