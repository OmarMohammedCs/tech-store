"use client";

import Image from "next/image";
import { Edit, Mail, ShoppingBag, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import OrdersComponent from "@/components/orders";
import { Button } from "@heroui/button";
import MainLayout from "@/app/mainLayout";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import api from "@/app/servise/api";

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  orderItems: Array<{
    product: string;
    quantity: number;
    _id: string;
  }>;
  address: string;
  city: string;
  phone: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  userName?: string;
  role: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [showProfile, setShowProfile] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAvatar, setSelectAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const saveModal = useDisclosure();
  const [user, setUser] = useState<User | null>(null);

 
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

 
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

 
  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectAvatar(file);
    setPreview(URL.createObjectURL(file));

    e.target.value = "";
    saveModal.onOpen();
  };


const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); 
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const handleUploadAvatar = async () => {
  if (!selectAvatar || !user) return;

  try {
    const avatarBase64 = await toBase64(selectAvatar);

    const res = await api.users.update({
      email: user.email,
      avatarBase64,  
    })

    const data = res.data;

    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: data.user.avatar };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });

    toast.success("Saved Successfully");
    saveModal.onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to upload avatar");
    saveModal.onClose();
  }
};


 
  const handleLogout = async() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    await api.auth.logout();
    signOut({
      callbackUrl: "/login", 
    });
  };

 
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id && !user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = user._id || user.id;
        const res = await api.orders.getByUser(userId);
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10 text-center">
          <p>Please login to view your profile</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
    
          <aside className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center">
              <label
                className="relative text-sm text-gray-500 mt-2 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                htmlFor="avatarUpload"
              >
                <Image
                  src={preview || user.avatar || "/person.png"}
                  alt="user"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
                <div className="absolute inset-0 rounded-full group-hover:bg-gray-100/50 group-hover:dark:bg-gray-600/50">
                  <h3 className="flex justify-center items-center font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 mt-12">
                    Change Avatar
                  </h3>
                </div>
              </label>

              <Input
                type="file"
                className="mt-3 hidden"
                id="avatarUpload"
                accept="image/*"
                onChange={handleSelectAvatar}
              />

              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>

            <nav className="space-y-2">
              <Button
                onClick={() => setShowProfile(true)}
                className={`w-full flex items-center gap-3 ${
                  showProfile ? "bg-blue-600 text-white" : ""
                }`}
              >
                <ShoppingBag size={18} />
                My Profile
              </Button>

              <Button
                onClick={() => setShowProfile(false)}
                className={`w-full flex items-center gap-3 ${
                  !showProfile ? "bg-blue-600 text-white" : ""
                }`}
              >
                <ShoppingBag size={18} />
                Orders
              </Button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </aside>

           
          {showProfile ? (
            <section className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Profile Information</h1>
               
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={<Mail size={18} />} label="Email" value={user.email} />
                <InfoCard icon={<ShoppingBag size={18} />} label="Total Orders" value={String(orders.length)} />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                {loading ? (
                  <p className="text-center text-gray-500">Loading orders...</p>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order._id}
                        className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                      >
                        <div>
                          <p className="font-medium">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">{order.orderItems.length} item(s)</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm capitalize px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{order.paymentMethod.toUpperCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No orders found</p>
                )}
              </div>
            </section>
          ) : (
            <div className="lg:col-span-3">
              <OrdersComponent />
            </div>
          )}
        </div>
      </div>

      {/* Avatar Save Modal */}
      <Modal
        isOpen={saveModal.isOpen}
        onOpenChange={saveModal.onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader>Confirm Save</ModalHeader>
              <ModalBody className="space-y-1">
                <p>Are you sure you want to save changes?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => closeModal()}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUploadAvatar}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </MainLayout>
  );
}


function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
