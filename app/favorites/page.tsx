"use client";

import Card from "@/components/cardFav";
import MainLayout from "../mainLayout";
import { useEffect, useState } from "react";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import toast from "react-hot-toast";
import api from "../servise/api";

function FavoritesPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    document.title = "TechStore - Favorites";
  }, [])

  const fetchFavorites = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    try {
      const res = await api.favorites.getAll(user.id);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to fetch favorites");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDelete = async (id: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      await api.favorites.delete(id, user.id);
     fetchFavorites()
      toast.success("Product removed from favorites!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove product");
    }
  };

  return (
    <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Favorites"]} />
      <div className="flex flex-wrap gap-6 justify-center mt-6 mb-10">
        {data.length > 0 ? (
          data.map(product => (
            <Card key={product._id} product={product} onDelete={handleDelete} />
          ))
        ) : (
          <div className="flex justify-center items-center h-64 w-full">
            <p className="text-center text-gray-500">No favorites added yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default FavoritesPage;
