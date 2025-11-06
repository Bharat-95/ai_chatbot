"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Bot } from "lucide-react";
import PasswordInput from "../../../components/ui/password-input"; // ⬅️ new
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import Header from "../../../components/AiPage/Header";

// Form validation schemas
const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

const Signup = () => {
  // const { signIn } = useClerk();
  const router = useRouter();

  // Form states
  const [verificationStep, setVerificationStep] = useState("signup");
  const [emailForVerification, setEmailForVerification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ⬅️ new
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSignUp = async (values) => {
  setIsLoading(true);
  setError("");

  try {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo: `${location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    console.log("User signed up:", data.user);


    router.push("/sign-in");

  } catch (err) {
    console.error("Signup error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
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

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 gap-10 bg-white lg:mx-20">
      <Header />
      <div className="hidden w-[40%] lg:block md:block relative">
        <Image
          src="/signup.png"
          alt="signup Image"
          width={450}
          height={800} // ← Increased height here
          className="h-[550px] w-[100%] object-cover rounded-md shadow-md"
          priority
        />
      </div>

      {/* Right side content (changes based on step) */}
      <div className="w-full max-w-md">
        <div className="flex flex-col md:flex-row justify-center text-center items-center gap-2 text-xl font-bold text-gray-800 py-10">
          <Image src='/bot.png' alt="No Logo Found" width={28} height={28} />
          Ai Chatbot
        </div>
        {verificationStep === "signup" ? (
          <div className="max-w-md w-full space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
              <p className="text-gray-600 mb-6">
                Start your journey in car sales and begin earning commissions.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
                className="space-y-4"
              >
                <div id="clerk-captcha"></div>
                <FormField
                  control={signUpForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          isVisible={showPassword}
                          onToggle={() => setShowPassword((v) => !v)}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          isVisible={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword((v) => !v)}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-black text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Image src="/google.svg" alt="google" width={25} height={25} />
              Log in with Google
            </button>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="/sign-in"
                  className="font-medium text-black hover:text-black/70"
                >
                  Log In
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Verify Your Email
              </h1>
              <p className="mt-2 text-gray-600">
                We've sent a 6-digit code to{" "}
                <span className="font-medium">{emailForVerification}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
