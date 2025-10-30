"use client";

import Modal from "../../../app/components/Modal";
import {
  Search,
  Calendar,
  Info,
  FileText,
  Loader
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import jsPDF from "jspdf";
import PaginationBar from "../../../app/components/Pagination";
import { parseISO, format } from "date-fns"; // Import parseISO for ISO 8601 parsing

const ITEMS_PER_PAGE = 5;

type Invoice = {
  id: string;
  invoiceId: string;
  dateOfSale: string;
  plan_name: string;
  amount: string;
};

// Utility to format date strings to "d MMM yyyy, h:mm a"
const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  try {
    // parseISO will accept ISO 8601 timestamps (e.g. "2025-08-19T16:03:13.152Z")
    const date = parseISO(dateString);
    // format with date & time (12h with AM/PM). Adjust format tokens if you prefer 24h.
    return format(date, "d MMM yyyy, h:mm a");
  } catch (error) {
    console.error("[InvoiceTable] Error formatting date:", dateString, error);
    // fallback to raw string if parsing/format fails
    return dateString || "-";
  }
};

export default function InvoiceTable() {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: any) => state?.user);

  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataInvoice, setInvoice] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentInvoices = dataInvoice.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    const handleFetchInvoices = async () => {
      setLoading(true);
      try {
        let query = supabaseBrowser
          .from("invoice")
          .select("id, invoiceId, dateOfSale, plan_name, amount", { count: "exact" })
          .eq("salesName", user?.id)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        // Apply filters
        if (search) {
          query = query.ilike("invoiceId", `%${search}%`);
        }

        if (selectedDate) {
          const dateStr = selectedDate.toISOString().split("T")[0];
          query = query
            .gte("created_at", `${dateStr} 00:00:00`)
            .lte("created_at", `${dateStr} 23:59:59`);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error("[InvoiceTable] Error fetching invoices:", error);
          setError(error.message);
        } else {
          setInvoice(data || []);
          setTotal(count || 0);
        }
      } catch (error: any) {
        console.error("[InvoiceTable] Error:", error);
        setError("Failed to fetch invoice data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      handleFetchInvoices();
    }
  }, [page, search, limit, selectedDate, user]);

  const handleDownload = async (row: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const labelX = 20;
    const valueX = 80;
    const maxWidth = pageWidth - valueX - 20;
    const lineHeight = 10;

    // Add Razorpay logo
    const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Razorpay_Logo.png";
    try {
      doc.addImage(logoUrl, "PNG", pageWidth / 2 - 15, 10, 30, 10);
    } catch (error) {
      console.error("[InvoiceTable] Error adding logo to PDF:", error);
    }

    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FB Marketplace Chatbot", pageWidth / 2, 30, { align: "center" });

    // Invoice title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Invoice", pageWidth / 2, 45, { align: "center" });

    // Data rows
    const data = [
      ["Invoice ID", row?.invoiceId],
      ["Plan Name", row?.plan_name],
      ["Date of Sale", formatDateTime(row?.dateOfSale)],
      ["Amount", Number(row?.amount || 0).toLocaleString()],
    ];

    let currentY = 60;
    doc.setFontSize(12);

    data.forEach(([label, value]) => {
      const displayValue = `${value || "-"}`;
      const wrappedValue = doc.splitTextToSize(displayValue, maxWidth);

      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, labelX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(wrappedValue, valueX, currentY);

      currentY += wrappedValue.length * lineHeight;
    });

    doc.save(`invoice_${row.invoiceId}.pdf`);
  };

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <main className="flex-1 min-h-screen p-4 bg-white">
        <section className="bg-white rounded-lg  overflow-x-auto lg:w-[100%] w-[320px]">
          {/* Filter Form */}
          <form
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
                placeholder="Search by Invoice ID"
                className="w-full text-sm text-gray-500 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700 bg-white w-full sm:w-auto">
                <Calendar size={16} className="text-gray-400" />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    setSelectedDate(date);
                    setPage(1);
                  }}
                  placeholderText="Choose Date"
                  dateFormat="d MMM yyyy" // Format: 19 Aug 2025
                  className="outline-none bg-transparent w-full"
                />
              </div>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-6 animate-pulse flex justify-center items-center h-screen"><Loader className="h-10 w-10 animate-spin text-[#9966cc]"/></div>
            ) : dataInvoice.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No invoices found.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-700 rounded-md">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-xs font-medium text-gray-500">
                    {["INVOICE ID", "PLAN NAME", "DATE OF SALE", "AMOUNT", "ACTIONS"].map((heading) => (
                      <th key={heading} className="py-3 px-4 font-semibold rounded-t-md">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{row.invoiceId}</td>
                      <td className="py-3 px-4">{row.plan_name}</td>
                      <td className="py-3 px-4">{formatDateTime(row.dateOfSale)}</td>
                      <td className="py-3 px-4">{Number(row.amount || 0).toLocaleString()}</td>
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
                          <button
                            onClick={() => handleDownload(row)}
                            className="cursor-pointer bg-[#ebe3f4] text-[#bd95e5] rounded-md p-2 hover:bg-[#c3d9ff] flex items-center gap-1 font-semibold"
                          >
                            <FileText className="w-4 h-4" />
                            PDF
                          </button>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h2>
          <div className="text-sm text-gray-700 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Invoice ID:</span>
              <span>{selectedData?.invoiceId || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Plan Name:</span>
              <span>{selectedData?.plan_name || ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date of Sale:</span>
              <span>{formatDateTime(selectedData?.dateOfSale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span>{Number(selectedData?.amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
