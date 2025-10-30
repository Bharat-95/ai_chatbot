"use client";
import { useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bot } from "lucide-react";
import Header from "../../../components/AiPage/Header";



const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setError("");
      setMessage("");
      await handleFindUser(email);
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`, // make sure this page exists
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset link has been sent to your email.");
      }
      setLoading(false);
    } catch (error: any) {
      console.log("Error resetting password:", error);
      setError(
        error?.message ||
          "An unexpected error occurred. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleFindUser = async (email: string) => {
    const { data, error } = await supabaseBrowser
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    console.log("User data:", data);
    if (error || !data) {
      console.log("Error fetching user:", error);
      throw new Error("User not found");
    }
    return data;
  };

  return (
    <div className="flex gap-10 justify-center items-center min-h-screen ">
      <Header />
      {/* Left side image */}
        <div className="hidden w-[35%] lg:block md:block relative">
      <Image
        src="/forgot-password.png"
        alt="forgot password"
           width={450}
          height={800} // ← Increased height here
          className="h-[550px] w-[100%] object-cover rounded-md shadow-md"
          priority
      />
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-auto px-4 py-8 lg:p-0">
        <div className="flex flex-col md:flex-row justify-center text-center items-center gap-2 text-xl font-bold text-gray-800 py-10">
                    <Image src='/bot.png' width={30} height={30} alt="no image found" />
                    Ai Chatbot
                  </div>
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Forgot Your Password?
          </h2>
          <p className="text-gray-600 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-md hover:bg-black/70 focus:ring-1 focus:ring-black disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/sign-in")}
              className="cursor-pointer text-black hover:text-black/70 text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
