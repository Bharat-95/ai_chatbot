// app/dashboard/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Handshake, TicketPercent, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";
import { useSelector } from "react-redux";
import { SubscriptionDialog } from "../components/subscription/SubscriptionModal";
import SubscriptionPayment from "../components/subscription/list/subscription-payment";
import ShowUserId from "./_components/ShowUserId";
import GoogleSheet from "./_components/GoogleSheet";
import FbChatBotLink from "./_components/FbChatBotLink"

type planState = {
  plan_name: string;
  commission: string;
  id: string;
  type: string;
  hst_tax?: string;
  amount: string;
  basic_amount?: string;
};

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state?.user);
  const [stats, setStats] = useState({
    total: 0, // invoices count
    totalLeads: 0, // leads count
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataInvoice, setInvoice] = useState<any[]>([]);
  const [filter, setFilter] = useState<any>("6months");
  const [graphStats, setGraphStat] = useState<any[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<planState | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // New state for user ID

  const getFilterDate = (
    filter: "6months" | "3months" | "12months" | "all"
  ): string | null => {
    if (filter === "all") return null;
    const date = new Date();
    switch (filter) {
      case "3months":
        date.setMonth(date.getMonth() - 3);
        break;
      case "6months":
        date.setMonth(date.getMonth() - 6);
        break;
      case "12months":
        date.setMonth(date.getMonth() - 12);
        break;
    }
    return date.toISOString();
  };

  const handleShowPopModal = async (userId: string) => {
    const modalShown = sessionStorage.getItem("modal_shown");
    const { data } = await supabaseBrowser
      .from("user_subscription")
      .select(`*, subscription(*)`)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (!data && !modalShown) {
      setShowModal(true);
      sessionStorage.setItem("modal_shown", "true");
    }
  };

  const handleFetchData = async () => {
  setLoading(true);

  let effectiveUserId: string | null = null;

  try {
    // Fetch user ID from Supabase
    const { data: { user: authUser }, error: authError } = await supabaseBrowser.auth.getUser();
    if (authError) {
      console.error("Error fetching user ID:", authError);
      setError("Failed to fetch user ID");
      return;
    }

    if (authUser) {
      setUserId(authUser.id);
    } else {
      setError("No authenticated user found");
      return;
    }

    // Determine effective user ID
    effectiveUserId = user?.id || authUser.id;

    // Fetch subscription modal data
    await handleShowPopModal(effectiveUserId);

    // Fetch invoices
    let query = supabaseBrowser
      .from("invoice")
      .select("*, users!inner(*)", { count: "exact" })
      .eq("salesName", effectiveUserId)
      .order("created_at", { ascending: false });

    const filterDate = getFilterDate(filter);
    if (filterDate) {
      query = query.gte("created_at", filterDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      setError(error.message);
    } else {
      setInvoice(data.slice(0, 4));

      // Fetch leads count for this user
      const { count: leadsCount, error: leadsError } = await supabaseBrowser
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", effectiveUserId); 

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        setError(leadsError.message);
      } else {
        setStats({
          total: data?.length || 0,
          totalLeads: leadsCount || 0,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Failed to fetch data");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    handleFetchData();
  }, [filter, user]);

  useEffect(() => {
    const clearModalShown = () => {
      sessionStorage.removeItem("modal_shown");
    };
    window.addEventListener("beforeunload", clearModalShown);
    return () => window.removeEventListener("beforeunload", clearModalShown);
  }, []);


useEffect(() => {
  const updateWebsiteLastOpened = async () => {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) return;

    const { error } = await supabaseBrowser
      .from("users")
      .update({ website_last_opened: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating website_last_opened:", error);
    }
  };

  updateWebsiteLastOpened();
}, []); // runs every time Dashboard mounts




  return (
    <>
      {showModal && (
        <SubscriptionDialog
          setShowModal={setShowModal}
          setPaymentMethod={setPaymentMethod}
          setSelectedSubscription={setSelectedSubscription}
        />
      )}

      {loading ? (
        <div className="space-y-6 animate-pulse flex justify-center items-center h-screen">
          <Loader className="h-10 w-10 animate-spin text-black" />
        </div>
      ) : !paymentMethod ? (
        <div className="space-y-6 p-6 bg-white min-h-screen">
          <ShowUserId userId={userId} />
         
        

          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Invoice
                </CardTitle>
                <Handshake className="h-5 w-5 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total?.toLocaleString() || 0}
                </div>
                <Link
                  href="/dashboard/invoices"
                  className="text-sm text-black hover:underline"
                >
                  View Details
                </Link>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Leads
                </CardTitle>
                <TicketPercent className="h-5 w-5 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalLeads?.toLocaleString() || 0}
                </div>
                <Link
                  href="/dashboard/leads"
                  className="text-sm text-black hover:underline"
                >
                  View Details
                </Link>
              </CardContent>
            </Card>
          </div>
          <Card className="w-full border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Invoice Added</CardTitle>
                <Link
                  href="/dashboard/invoices"
                  className="text-sm text-black hover:underline"
                >
                  View Invoice
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataInvoice.map((deal) => (
                    <TableRow key={deal?.invoiceId}>
                      <TableCell>{deal?.invoiceId}</TableCell>
                      <TableCell>
                        {deal?.users?.full_name ||
                          deal?.users?.display_name ||
                          deal?.users?.email ||
                          " "}
                      </TableCell>
                      <TableCell>{deal?.users?.phone}</TableCell>
                      <TableCell>
                        ${Number(deal?.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(deal?.created_at).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <SubscriptionPayment
          selectedSubscription={selectedSubscription}
          handleCancelPayment={() => {
            setSelectedSubscription(null);
            setPaymentMethod(false);
          }}
        />
      )}
    </>
  );
}