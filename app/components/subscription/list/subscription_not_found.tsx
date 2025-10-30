// pages/something-went-wrong.tsx

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SomethingWentWrong() {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 max-w-md w-full text-center">
        <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={60} />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          An unexpected error occurred. Please try again later or contact
          support if the problem persists.
        </p>
        <Link
          href="/dashboard/subscription"
          className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
