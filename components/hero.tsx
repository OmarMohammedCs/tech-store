import { Button } from "@heroui/button";
import Image from "next/image";
import React, { useState, useEffect } from "react";

type HeroProps = {
  height?: number;
};

export default function Hero({ height }: HeroProps) {
  const slides = [
    {
  id: 1,
  image: "/phone1.jpg",
  title: "Everything You Need in One App",
  subtitle: "Smart Experience",
  description: "Manage your daily tasks, track your progress, and stay organized with a clean and intuitive interface.",
  button1: "Start Now",
  button2: "View Features"
},
{
  id: 2,
  image: "/phone2.jpg",
  title: "Designed for Speed & Simplicity",
  subtitle: "Performance",
  description: "Enjoy a fast, responsive experience built to help you focus on what matters without distractions.",
  button1: "Try It",
  button2: "See How"
},
{
  id: 3,
  image: "/laptop.jpg",
  title: "Work Seamlessly Across Devices",
  subtitle: "Cross-Platform",
  description: "Access your data anytime, anywhere. Your workflow stays synced between mobile and desktop.",
  button1: "Get Started",
  button2: "Learn More"
},
{
  id: 4,
  image: "/camera.jpg",
  title: "Capture, Create, Share",
  subtitle: "Creative Tools",
  description: "Powerful tools that make it easy to create and share your content with just a few clicks.",
  button1: "Explore",
  button2: "Discover"
}

  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className={`relative w-full h-[${height}px] rounded-2xl overflow-hidden`}>
      {/* Image */}
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        priority={currentSlide === 0}
        className="object-cover transition-opacity duration-500"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-sky-50/50 dark:bg-black/50" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
        <p className="mb-4 w-fit rounded-full border border-blue-900 bg-[#12283E] px-3 py-1 text-[10px] font-bold text-white">
          {slide.subtitle}
        </p>

        <h1 className="mb-4 max-w-xl text-2xl font-bold text-white md:text-3xl">
          {slide.title}
        </h1>

        <p className="max-w-xl text-[14px] text-gray-200 md:text-[16px]">
          {slide.description}
        </p>

        <div className="mt-6 hidden md:flex flex-wrap gap-4">
          <Button color="primary" className="shadow-xs shadow-blue-600">
            {slide.button1}
          </Button>

          <Button variant="bordered" className="text-white border-white">
            {slide.button2}
          </Button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
      >
        ›
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-blue-500 w-6"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}