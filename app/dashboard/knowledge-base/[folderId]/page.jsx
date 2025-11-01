"use client";

import React from "react";
import { LiaPenNibSolid } from "react-icons/lia";
import { PiUploadThin } from "react-icons/pi";
import { IoIosLink } from "react-icons/io";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import StoredDocuments from "../_components/StoredDocuments";

export default function FolderDashboard({ params }) {
  // ✅ This still works fine in client components
  const { folderId } = params;

  const handleDocSelect = (doc) => {
    console.log("selected doc", doc);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/dashboard/knowledge-base"
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Back to Folders"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-[17px] font-semibold">Create Documents</h2>
      </div>

      <p className="text-[14px] text-gray-500 -mt-2">
        You can create a new document in this folder by writing,
        uploading an existing document or importing a webpage.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <Link
          href={`/dashboard/knowledge-base/${folderId}/create`}
          className="px-4 py-4 border rounded-lg bg-blue-50 border-blue-200 block hover:shadow-sm transition"
        >
          <LiaPenNibSolid size={30} color="blue" />
          <h3 className="font-semibold mt-2">Write</h3>
          <p className="text-sm text-gray-600 mt-1">
            Write or copy paste your document
          </p>
        </Link>

        <Link
          href={`/dashboard/knowledge-base/${folderId}/upload`}
          className="px-4 py-4 border rounded-lg bg-purple-50 border-purple-200 block hover:shadow-sm transition"
        >
          <PiUploadThin size={30} color="purple" />
          <h3 className="font-semibold mt-2">Upload</h3>
          <p className="text-sm text-gray-600 mt-1">
            PDF, Word or PowerPoint files
          </p>
        </Link>

        <Link
          href={`/dashboard/knowledge-base/${folderId}/website`}
          className="px-4 py-4 border rounded-lg bg-green-50 border-green-200 block hover:shadow-sm transition"
        >
          <IoIosLink size={30} color="green" />
          <h3 className="font-semibold mt-2">Import Website</h3>
          <p className="text-sm text-gray-600 mt-1">
            Webpage with text content
          </p>
        </Link>
      </div>

      <StoredDocuments folderId={folderId} onSelect={handleDocSelect} />
    </div>
  );
}
