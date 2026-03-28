"use client";

import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import api from "../servise/api";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);
  const { data: session } = useSession();
  let Icon = hidden ? EyeOff : Eye;

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Register - TechStore";
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchToken = async () => {
      try {
        const res = await api.auth.googleLogin()
        const data = res.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/");
      } catch (error) {
        console.error("Failed to fetch JWT token:", error);
      }
    };

    fetchToken();
  }, [session]);

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.register(registerData);

      toast.success("Account created successfully!");
      setTimeout(() => router.push("/login"), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Create Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Join us and start your journey
            </p>
          </div>

         
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />
            <div className="relative">
              <Input
                label="Password"
                type={hidden ? "password" : "text"}
                placeholder="••••••••"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
              <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" onClick={() => setHidden(!hidden)} />
            </div>


          
            <Button
              onClick={handleRegister}
              isLoading={isLoading}
              isDisabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2 shadow-md transition-all duration-200"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </p>

        
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            
            <Button
              onClick={async () => {
                try {
                  const res = await signIn("google", { redirect: false });

                  if (res?.ok) {
                    const tokenRes = await api.auth.googleLogin();
                    const data = tokenRes.data;

                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    router.push("/");
                  } else {
                    console.error("Google login failed", res);
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} /> Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
