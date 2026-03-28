"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import toast, { Toaster } from "react-hot-toast";
import api from "../servise/api";

function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.auth.forgotPassword({ email });

      setMessage(res.data.message || "Reset link sent to your email");
      toast.success(res.data.message || "Reset link sent to your email");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Toaster position="top-right" />
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full bg-black dark:bg-gray-700 text-white rounded-lg p-2"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        {message && (
          <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ForgetPasswordPage;
