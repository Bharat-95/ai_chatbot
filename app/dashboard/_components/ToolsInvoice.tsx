"use client";

import Modal from "../../../app/components/Modal";
import {
  Search,
  Calendar,
  Eye,
  FileText,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
const ITEMS_PER_PAGE = 5;
import jsPDF from "jspdf";
import PaginationBar from "../../../app/components/Pagination";

type Invoice = {
  id: string;
  month: string;
  date: string;
  deals: string;
  commission: string;
};

const invoicesData: Invoice[] = [
  {
    id: "INV-2025-05",
    month: "May 2025",
    date: "May 30, 2025",
    deals: "5 Deals",
    commission: "$3,450",
  },
  {
    id: "INV-2025-04",
    month: "April 2025",
    date: "Apr 30, 2025",
    deals: "3 Deals",
    commission: "$1,950",
  },
  {
    id: "INV-2025-03",
    month: "March 2025",
    date: "Mar 31, 2025",
    deals: "2 Deals",
    commission: "$1,000",
  },
  {
    id: "INV-2025-02",
    month: "Feb 2025",
    date: "Feb 28, 2025",
    deals: "1 Deal",
    commission: "$700",
  },
  {
    id: "INV-2025-01",
    month: "Jan 2025",
    date: "Jan 31, 2025",
    deals: "4 Deals",
    commission: "$2,400",
  },
  {
    id: "INV-2024-12",
    month: "Dec 2024",
    date: "Dec 31, 2024",
    deals: "3 Deals",
    commission: "$1,200",
  },
  // Add more items here if needed
];

export default function ToolInvoiceTable() {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: any) => state?.user);

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Invoice[]>([]);
  const [dataInvoice, setInvoice] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  // const limit = 10;
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const totalPages = Math.ceil(total / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = invoicesData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    const handleFetchSeminar = async () => {
      setLoading(true);
      try {
        let query = supabaseBrowser
          .from("invoice")
          .select("*, users!inner(*)", {
            count: "exact",
          })
          .eq("salesName", user?.id)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        // Apply filters
        if (search) {
          query = query.ilike("users.email", `%${search}%`);
        }

        if (status && status != "all") {
          query = query.eq("status", status);
        }

        if (selectedDate) {
          query = query
            .gte("created_at", selectedDate + " 00:00:00")
            .lte("created_at", selectedDate + " 23:59:59");
        }

        const { data, error, count } = await query;

        if (error) {
          console.error(error);
          setError(error.message);
        } else {
          setInvoice(data);
          setTotal(count || 0); // Set total count of records
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch seminar data");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      handleFetchSeminar();
    }
  }, [page, search, status,limit, selectedDate, user, limit]);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = (row: any) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Invoice", 105, 20, { align: "center" });

    doc.setFontSize(12);
    const startY = 40;
    const lineHeight = 10;
    const data = [
      ["Invoice ID", row?.invoiceId],
      ["Sale Date", row?.dateOfSale],
      ["Car", row?.carModel],
      ["Sale Amount", row?.saleAmount],
      ["Commission", row?.commission],
      ["Status", row?.status],
      ["Uploaded File", row?.file],
    ];

    data.forEach(([label, value], i) => {
      doc.text(`${label}:`, 20, startY + i * lineHeight);
      doc.text(`${value || "-"}`, 70, startY + i * lineHeight);
    });

    doc.save("invoice.pdf");
  };

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1); // reset page on filter
  };

  return (
    <>
      <main className="flex-1 p-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
          {/* Filter Form */}
          {/* <form
            role="search"
            aria-label="Invoice search and filters"
            className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4 mb-6"
          >
            <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 w-full sm:w-72 text-gray-400">
              <Search className="w-4 h-4 mr-2" />
              <input
                type="search"
                id="search"
                name="search"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                placeholder="Search"
                className="w-full text-sm text-gray-500 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="border border-gray-200 rounded-md py-2 px-4 text-sm text-gray-700 w-full sm:w-40 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
            </select>

            <div className="relative">
              <div className="flex items-center gap-2 border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700 bg-white w-full sm:w-auto">
                <Calendar size={16} className="text-gray-400" />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setPage(1); // reset pagination if needed
                  }}
                  placeholderText="Choose Date"
                  dateFormat="MMM d, yyyy"
                  className="outline-none bg-transparent w-full"
                />
              </div>
            </div>
          </form> */}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 animate-pulse rounded-md"
                  ></div>
                ))}
              </div>
            ) : dataInvoice.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No invoices found.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-700 border border-gray-200 rounded-md">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Invoice ID",
                      "Username",
                      "Destails",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="py-3 px-4 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataInvoice.map((row) => (
                    <tr key={row?.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{row?.invoiceId}</td>
                      <td className="py-3 px-4">
                        {row?.users?.full_name ||
                          row?.users?.display_name ||
                          row?.users?.email ||
                          " "}
                      </td>
                      <td className="py-3 px-4">{row?.details}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            disabled={loading}
                            onClick={() => {
                              setSelectedData(row);
                              setIsOpen(true);
                            }}
                            className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {/* <button
                            onClick={() => handleDownload(row)}
                            className="cursor-pointer bg-[#D9E8FF] text-[#3B82F6] rounded-md p-2 hover:bg-[#c3d9ff] flex items-center gap-1 font-semibold"
                          >
                            <FileText className="w-4 h-4" />
                            PDF
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
      </main>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="mt-5 mb-5 max-w-md mx-auto p-6 bg-white shadow-md rounded-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Invoice Summary
          </h2>
          <div className="text-sm text-gray-700 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Invoice :</span>
              <span>{selectedData?.invoiceId || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Selected Sales :</span>
              <span>
                {selectedData?.users?.full_name ||
                  selectedData?.users?.display_name ||
                  selectedData?.users?.email ||
                  ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date of sale:</span>
              <span>{selectedData?.dateOfSale || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Car:</span>
              <span>{selectedData?.carModel || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sale Amount:</span>
              <span>{selectedData?.saleAmount || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Commission:</span>
              <span>{selectedData?.commission || ""} %</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Vin number :</span>
              <span className="flex items-center gap-1">
                {selectedData?.vinNumber || ""}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status :</span>
              <span className="flex items-center gap-1">
                {selectedData?.status || ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Commission Amount</span>
              <span>{selectedData?.commission_amount || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Details</span>
              <span>
                {selectedData?.details}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Uploaded File</span>
              <span>
                {" "}
                <a
                  href={selectedData?.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-blue-600 underline break-words max-w-full"
                >
                  📎 File
                </a>
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
