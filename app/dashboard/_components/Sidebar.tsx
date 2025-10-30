"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  FileText,
  User,
  Settings,
  LogOut,
  PenTool,
  Car,
  Video,
  History,
  TicketPercent,
  MessageSquareCode,
  Headset,
  Recycle,
  Bot,
  Library,
  MessageCircle,
  ChartColumn
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../../lib/utils";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { clearUser } from "../../../store/reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobile, collapsed]);

  const activePlan = user?.subscriptionPlan?.find((w: any) => w?.is_active);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/subscription", icon: Settings, label: "Subscription" },
      { href: "/dashboard/bots", icon: Bot, label: "Bots" },
     { href: "/dashboard/knowledge-base", icon: Library, label: "Knowledge Base" },
        
            { href: "/dashboard/logs", icon: ChartColumn, label: "Logs" },

   { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
    { href: "/dashboard/support", icon: Headset, label: "Support" },
    { href: "/dashboard/tutorials", icon: Video, label: "Tutorials" },
    { href: "/dashboard/recycle", icon: Recycle, label: "Recycle" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
     
  ];

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("modal_shown");
      const { error } = await supabaseBrowser.auth.signOut();
      if (error) throw error;
      setTimeout(() => dispatch(clearUser()), 5000);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href='/dashboard' className="px-3 py-3 border-b border-gray-200 flex items-center justify-start">
            <Image src='/bot.png' alt="No Logo Found"
              // Show smaller logo when collapsed (desktop or mobile)
              width={collapsed ? 40 : 40}
              height={collapsed ? 40 : 40}
              className="object-contain max-h-[50px] text-[#2563EB]"
            />
            {/* Show text only when not collapsed (desktop or mobile) */}
            {!collapsed && (
              <span className="ml-3 text-md font-semibold text-gray-800">
                Ai Chatbot
              </span>
            )}
          </Link>
          

          {/* Navigation */}
          <nav className="flex-1 mt-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return collapsed ? (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className={cn(
                          "cursor-pointer w-full h-12",
                          isActive && "bg-blue-50"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-gray-800 text-white"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                // Render full button when not collapsed
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "cursor-pointer w-full justify-start h-12",
                      isActive && "bg-blue-50 border-l-4 border-blue-600"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-2 py-2 border-t border-gray-200">
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-12 text-red-600 hover:text-red-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 text-white">Log out</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 hover:text-red-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Log out
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
