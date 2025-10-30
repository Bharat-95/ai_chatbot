"use client";
import React, { useEffect, useState } from "react";
import { Info, Loader, Mail } from "lucide-react";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { useSelector } from "react-redux";
import Modal from "../../Modal";
import PaginationBar from "../../Pagination";

const statusEnum: any = {
  payment_successful: "Successful",
  payment_pending: "Pending",
  payment_failed: "Failed",
  expired: "Expired",
};
export default function SubscriptionTable() {
  const [data, setData] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  // const limit = 10;
  const [limit, setLimit] = useState(10);
  const { user } = useSelector((state: any) => state?.user);

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);

      let query = supabaseBrowser
        .from("user_subscription")
        .select("*, subscription(*)", { count: "exact" })
        .eq("user_id", user.id) // join foreign table
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (search) {
        query = query.ilike("subscription.plan_name", `%${search}%`);
      }

      if (status && status !== "Status") {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error.message);
        setData([]);
        setTotal(0);
      } else {
        setData(data || []);
        setTotal(count || 0);
      }

      setLoading(false);
    };

    fetchData();
  }, [page, search, status, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <section className="bg-white lg:w-full md:w-full w-full ml-2 lg:ml-0 md:ml-0  rounded-lg border border-gray-200 ">
        <h3 className="text-base font-semibold text-gray-900 mb-4 px-6 py-4">
          Subscription History
        </h3>

        <form
          className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 gap-4 px-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1 max-w-md text-gray-400 focus-within:text-gray-600">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? <div></div> : null}
            </div>
            <input
              type="search"
              placeholder="Search"
              value={search}
              disabled={loading}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:ring-1 focus:ring-black focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={status}
              disabled={loading}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-md py-2 px-3 pr-10 text-sm text-gray-700 focus:ring-1 focus:ring-black focus:outline-none appearance-none w-full"
            >
              <option value="">All</option>
              <option value="payment_successful">Successful</option>
              <option value="payment_pending">Pending</option>
              <option value="payment_failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </form>

        <div className="w-full overflow-x-auto px-4">
        <table className="w-full text-sm text-left text-gray-700 border-collapse">
          <thead className="border-b border-gray-200">
            <tr>
              {[
                "Subscription Id",
                "Date",
                "Plan",
               
                "Amount",
                "Status",
                "Action",
              ].map((col) => (
                <th key={col} className="py-3 lg:px-4 md:px-4 px-2 font-semibold text-gray-900">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={100} className="py-10">
                  <div className="flex items-center justify-center w-full">
                   
                  </div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-400">
                  No records found.
                </td>
              </tr>
            )}
            {!loading && data.length > 0 && (
              <>
                {data.map((data: any) => (
                  <tr key={data.id} className="border-b border-gray-100 ">
                    <td className="py-3 px-4">{data?.id}</td>
                    <td className="py-3 px-4">
                      {new Date(data.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {data?.subscription?.plan_name}
                    </td>
                  
                    <td className="py-3 px-4">
                      ${data?.amount || data?.subscription?.amount}
                    </td>
                    <td className="py-3 px-4">{statusEnum[data?.status]}</td>
                    {/* <td className="py-3 px-4">
                    <button className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md px-3 py-1 hover:bg-blue-200">
                      <Mail className="w-4 h-4" />
                      <span>Invoice (PDF)</span>
                    </button>
                  </td> */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedData(data);
                          setIsOpen(true);
                        }}
                        className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
        </div>

        <div className="mt-auto">
          <PaginationBar
            page={page}
            setPage={setPage}
            totalPage={totalPages}
            totalRecord={total}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4  w-full max-w-md mx-auto">
          <h2 className="text-lg  font-semibold mb-4 text-gray-800">
            Subscription Details
          </h2>

          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between">
              <span className="text-gray-600">Subscription Id:</span>
              <span className="px-2 py-1 rounded-full font-semibold text-sm text-gray-600">
                {selectedData?.id}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold  text-sm text-gray-600">
                {" "}
                {new Date(selectedData?.created_at).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold  text-sm text-gray-600">
                {selectedData?.subscription?.plan_name} Monthly
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold  text-sm text-gray-600">
              
                $ {selectedData?.subscription?.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold  text-sm text-gray-600">
                {statusEnum[selectedData?.status]}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
