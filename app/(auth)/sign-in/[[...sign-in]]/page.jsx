"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { Eye, EyeOff, Loader } from "lucide-react";
import Header from "../../../components/AiPage/Header";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabaseBrowser.auth.getUser();

      if (error) {
        
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("User already logged in:", data.user);
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    console.log(data, error);
    await supabaseBrowser
      .from("users")
      .update({
        updated_at: new Date().toISOString(), // e.g., "2025-07-05T15:41:23.123Z"
      })
      .eq("id", data?.user?.id)
      .select()
      .single();
    if (error) {
      setError(error.message);
    } else {
      router.push("/callback");
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });
      console.log("Google sign-in data:", data);

      if (error) {
        setError("Google sign-in failed.");
        console.error(error);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during Google login.");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
       <Loader className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 gap-10 bg-white lg:mx-20">
      <Header />

      {/* Left Image Section */}
      <div className="hidden w-[40%] lg:block md:block relative">
        <Image
          src="/signin.jpg"
          alt="signin Image"
          width={480}
          height={800}
          className="h-[550px] w-[100%] object-cover rounded-md shadow-md"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 rounded-md z-10"></div>
        <div className="absolute bottom-10 left-10 text-white z-20">
          <h2 className="text-xl font-bold mb-2">
            You're One Step Closer to Selling <br /> Smarter on Facebook
          </h2>
          <p className="text-sm">Let our bot handle the rest.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full max-w-md">
        <div className="flex flex-col md:flex-row justify-center text-center items-center gap-2 text-xl font-bold text-gray-800 py-10">
          <Image src="/bot.png" alt="Logo" width={28} height={28} />
          Ai Chatbot
        </div>
        <h1 className="text-2xl font-bold mb-2">Login to Your Account</h1>
        <p className="text-gray-600 mb-6">
          Access your dashboard and manage your sales activities.
        </p>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-black border-gray-200 rounded"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-sm font-medium text-black hover:text-black/70"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-black hover:bg-black/70"
          >
            Log in
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-200 shadow rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Image src="/google.svg" alt="google" width={25} height={25} />
            Log in with Google
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/sign-up"
              className="font-medium text-black hover:text-black/70"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
