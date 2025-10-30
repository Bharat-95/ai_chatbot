// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, setUser } from "../../store/reducers/userSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { TooltipProvider } from "../components/ui/tooltip";
import { cn } from "../../lib/utils";
import { Loader } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { onAuthenticatedUser } from "../actions/auth";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectCurrentUser);
  const userStatus = useSelector((state: any) => state.user.status);
  const router = useRouter();

  useEffect(() => {
    // Only redirect after Redux has finished trying to load the user
    if (userStatus === "succeeded" && !user) {
      router.push("/");
    }

    if (userStatus === "succeeded" && user) {
      setLoading(false);
    }
  }, [user, userStatus]);

  useEffect(() => {
    const handleUserFetch = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();
    

      if (!session) {
        router.replace("/");
        return;
      }
      const result = await onAuthenticatedUser(session.access_token);
    

      if (result.status === 200 && result.user) {
        const { data } = await supabaseBrowser
          .from("user_subscription")
          .select("*")
          .eq("user_id", result.user?.id);
        dispatch(setUser({ ...result.user, subscriptionPlan: data }));
      } else {
        router.replace("/");
      }

      setLoading(false);
    };
    handleUserFetch();
  }, []);

  return (
    <>
     
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50 flex">
  
            <div> 
              <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
              />
            </div>

            {/* Main content area */}
            <main
              className={cn(
                "flex-1 transition-all duration-300",
                "ml-12 md:ml-14", 
                !sidebarCollapsed && "md:ml-56" 
              )}
            >
              <div
                className={cn(
                  "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
                )}
              >
                <Header
                  collapsed={sidebarCollapsed}
                  setCollapsed={setSidebarCollapsed}
                />
                <main className="flex-1  overflow-y-auto bg-gray-50">
                  {children}
                </main>
              </div>
            </main>
          </div> 
        </TooltipProvider>
    </>
  );
}