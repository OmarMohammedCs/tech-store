"use client";

import { useEffect, useState } from "react";
import MainLayout from "../mainLayout";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import Card from "@/components/card";
import { Divider } from "@heroui/divider";
import { CheckboxGroup, Checkbox, Input, Pagination } from "@heroui/react";
import Hero from "@/components/hero";
import { useSearchParams } from "next/navigation";
import api from "../servise/api";
import FilterProducts from "@/components/filterProductsMobile";


function ProductsClient () {
      const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const categoryId = useSearchParams().get("category")


  useEffect(() => {
    document.title = "TechStore - Products";

  }, [])

  useEffect(() => {
    if (categoryId) {
      setSelectedCategories([categoryId]);
    }
  }, [categoryId]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.categories.getAll();
      const json = res.data;

      const uniqueCategories = Array.from(
        new Set(json.map((cat: any) => cat))
      );

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: perPage,
        minPrice,
        maxPrice,
      };
      if (selectedCategories.length) params.categories = selectedCategories.join(",");


      const query = new URLSearchParams(params).toString();
      
      const res = await api.products.getAll(query);
      const json = res.data;

      setProducts(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  
  useEffect(() => {
    fetchProducts();
  }, [page, minPrice, maxPrice, selectedCategories, rating]);
  useEffect(() => {
    fetchCategories();
  }, []);
    return(
           <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Products"]} />

      {/* Hero */}
      <div className="relative w-full h-[260px] rounded-2xl overflow-hidden mb-10">
        <Hero height={260} />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Filters */}
        <aside className="hidden md:block md:col-span-1">
          {/* Price Filter */}
          <h3 className="font-semibold mb-3">Price Range</h3>
          <input
            type="range"
            min={100}
            max={20000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex items-center gap-3 mt-3">
            <Input
              type="number"
              value={minPrice as any}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              startContent={<span className="text-default-400">$</span>}
            />
            <span className="w-6 h-1 bg-gray-400 rounded" />
            <Input
              type="number"
              value={maxPrice as any}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              startContent={<span className="text-default-400">$</span>}
            />
          </div>

          <Divider className="my-6" />

          {/* Categories */}
          <CheckboxGroup
            label="Categories"
            classNames={{ label: "font-semibold" }}
            value={selectedCategories}
            onChange={(val) => setSelectedCategories(val as string[])}
          >
            {categories.map((cat: any, i: number) => (
              <Checkbox key={i} value={String(cat._id)} >
                {cat.name}
              </Checkbox>
            ))}
          </CheckboxGroup>

          <Divider className="my-6" />

          {/* Rating */}
          <h3 className="font-semibold mb-3">Rating</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  className="accent-blue-500"
                  onChange={() => setRating(r)}
                  checked={rating === r}
                />
                <div>
                  {[...Array(r)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                  {[...Array(5 - r)].map((_, i) => <span key={i} className="text-gray-300">★</span>)}
                </div>
              </label>
            ))}
          </div>
        </aside>

        {/* Products */}
        <section className="md:col-span-4">

<div className="flex justify-between items-center mb-4 md:hidden">
    <h2 className="text-lg font-semibold">Products</h2>

    <FilterProducts
      price={maxPrice}
      setPrice={setMaxPrice}
      minPrice={minPrice}
      setMinPrice={setMinPrice}
      categories={categories}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      rating={rating}
      setRating={setRating}
    />
  </div>


          <div className="flex flex-wrap gap-6 justify-center">
            {loading ? (
              <p>Loading...</p>
            ) : products.length > 0 ? (
              products.map((product) => <Card key={product._id} product={product} />)
            ) : (
              <p>No products found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination
              color="primary"
              initialPage={page}
              total={totalPages}
              onChange={(p) => setPage(p)}
            />
          </div>
        </section>
      </div>
    </MainLayout>
    )
}

export default ProductsClient;