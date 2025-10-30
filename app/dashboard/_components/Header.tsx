// app/dashboard/_components/Header.tsx
"use client";

import { Button } from "../../components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  RefreshCcw,
  Download,
} from "lucide-react";
import { clearUser } from "../../../store/reducers/userSlice";
import { useDispatch } from "react-redux";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { showToast } from "../../../hooks/useToast";
import { exportToExcel } from "../../../lib/exportToExcel";

interface HeaderProps {
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
  setSidebarOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const pathName: any = {
  "/dashboard/profile": "Profile",
   "/dashboard/knowledge-base": "Knowledge Base",
    "/dashboard/bots": "Bots",
     "/dashboard/logs": "Logs",
  "/dashboard/subscription": "My Subscription",
  "/dashboard/subscription-buy": "Buy Subscription",
  "/dashboard/subscription-buy/success": "Subscription",
  "/dashboard/subscription-buy/cancel": "Subscription",
  "/dashboard": "Dashboard",
  "/dashboard/calculator": "Calculator",
  "/dashboard/user-tools": "Tools",
  "/dashboard/invoices": "Invoices",
  "/dashboard/leads": "Leads",
  "/dashboard/prompt": "Prompt",
  "/dashboard/support": "Support",
  "/dashboard/tutorials": "Tutorial",
};

const Header = ({ collapsed, setCollapsed }: HeaderProps) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExportLeads = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_date", { ascending: false });

     if (error) {
        throw new Error("Something went wrong!");
      }

      await exportToExcel(data, "leads");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };


  const handleExport = async () => {
    if (pathname === "/dashboard/leads") {
      await handleExportLeads();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed?.(!collapsed)}
          className="h-10 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
        <span className="lg:text-lg md:text-md text-sm font-bold text-gray-800">
          {pathName[pathname] || "Dashboard"}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {pathname === "/dashboard/leads" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="cursor-pointer h-9 w-9 border border-gray-200 shadow"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Link href="/">
          <Button
            variant="default"
            size="icon"
            className="bg-[#9966cc] text-white hover:bg-[#bb8fe7]"
          >
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="outline"
          size="icon"
          onClick={() => window.location.reload()}
          className="h-9 w-9"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
