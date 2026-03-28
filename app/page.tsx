"use client";

import Card from "@/components/card";
import Hero from "@/components/hero";
import MainLayout from "./mainLayout";

import { Button } from "@heroui/button";
import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Camera,
  Watch,
  Tv,
  Speaker,
} from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "./servise/api";

/*  Icons Map  */
const iconsMap = {
  laptops: Laptop,
  phones: Smartphone,
  accessories: Headphones,
  gaming: Gamepad2,
  camera: Camera,
  smartwatch: Watch,
  tv: Tv,
  audio: Speaker,
};
type Category = {
  _id: string;
  name: string;
};


export default function Home() {
  const [hidden, setHidden] = useState<boolean>(true);
  const [move, setMove] = useState<number>(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
 const [categories, setCategories] = useState<Category[]>([]);


 useEffect(() => {
    document.title = "TechStore - Home";
  }, [])

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.categories.getAll();

      setCategories(res.data); 

    } catch (error) {
      console.log(error);
    }
  };

  fetchCategories();
}, []);

  
const CARD_WIDTH = 256;
  useEffect(() => {
    document.title = "TechStore - Home";
  }, []);


 
  const handelHide = () => setHidden(!hidden);

  const handelMoveNext = () => {
    const maxMove = products.length * CARD_WIDTH - window.innerWidth + 120;
    if (move >= maxMove) return;
    setMove((prev) => prev + CARD_WIDTH);
  };

  const handelMovePrev = () => {
    if (move === 0) return;
    setMove((prev) => prev - CARD_WIDTH);
  };

 
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.products.getAll()
        setProducts(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <MainLayout>
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-10">
            <Hero height={420} />
          </div>

    
      <section className="mt-12 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-2xl font-bold">Browse By Category</h2>
          <p
            onClick={handelHide}
            className="text-blue-500 text-[14px] md:text-[16px] flex items-center gap-1 cursor-pointer hover:gap-2 transition-all"
          >
            View All <ArrowRight size={18} />
          </p>
        </div>

<div
  className={`
  grid grid-cols-2
  sm:grid-cols-3
  md:grid-cols-4
  lg:grid-cols-5
  gap-6
  ${hidden ? "max-h-36 overflow-hidden" : "max-h-full"}
 
`}
>
  {categories.map((category) => {
    const key =
      category.name.toLowerCase() as keyof typeof iconsMap;

    const Icon = iconsMap[key] || Laptop;

    return (
      <Link
        key={category._id}
        href={`/products?category=${category._id}`}
      >
        <div
          className={`
          group rounded-2xl
          bg-white dark:bg-[#0F172A]
          border border-gray-100 dark:border-gray-800
          p-5 flex flex-col items-center justify-center
          shadow-sm dark:shadow-none
          hover:shadow-xl hover:shadow-blue-500/10
          transition-all duration-300
          hover:-translate-y-1 cursor-pointer
          
        `}
        >
          <div
            className="
            flex items-center justify-center
            h-14 w-14 rounded-full
            bg-blue-50 text-blue-600
            dark:bg-blue-500/10 dark:text-blue-400
            group-hover:bg-blue-600 group-hover:text-white
            transition-all duration-300
          "
          >
            <Icon size={28} />
          </div>

          <h3 className="mt-4 text-sm font-semibold">
            {category.name}
          </h3>
        </div>
      </Link>
    );
  })}
</div>
      </section>
 
      <section className="mt-16">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-[17px] md:text-2xl font-bold">Featured Products</h2>
            <p className="text-gray-500 text-sm">Lorem ipsum dolor sit.</p>
          </div>

          <div className="flex gap-2">
            <Button isIconOnly radius="full" onClick={handelMovePrev}>
              <ArrowLeft />
            </Button>
            <Button isIconOnly radius="full" onClick={handelMoveNext}>
              <ArrowRight />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300"
            style={{ transform: `translateX(-${move}px)` }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="shrink-0"
                style={{ width: CARD_WIDTH }}
              >
                <Card product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
 
      <section
        id="aboutUs"
        className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 mt-20 py-16 px-6 md:px-12
        flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div>
          <p className="mb-4 w-fit rounded-full border border-blue-900 bg-[#12283E] px-3 py-1 text-xs font-bold text-white">
            New Release
          </p>

          <h1 className="mb-4 max-w-xl text-3xl font-bold text-white md:text-4xl">
            Welcome To TechStore
          </h1>

          <p className="max-w-xl text-base text-gray-200 md:text-lg">
            Shop smart with modern eCommerce powered by Next.js
          </p>

          <Button color="primary" className="mt-6">
            Get Started <ArrowRight />
          </Button>
        </div>

        <div className="relative rotate-3">
          <Image
            src="/laptop.jpg"
            alt="Product"
            width={260}
            height={260}
            className="rounded-md shadow-lg"
            priority
          />
          <div className="absolute inset-0 bg-sky-50/30 dark:bg-black/50 rounded-md" />
        </div>
      </section>
    </MainLayout>
  );
}



