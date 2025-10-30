"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calculator, FileText, User, Settings } from "lucide-react";
import ProfileManagement from "./ProfileManagement";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/reducers/userSlice";
import { getSubscriptionDetails } from "../../../lib/data";
import { useRouter } from "next/navigation";

const MainSection = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const user = useSelector(selectCurrentUser);
  const subscriptionDetails = getSubscriptionDetails(
    user?.subscriptionPlan || "basic"
  );
  const subscriptionPrice = subscriptionDetails.price;
  const commissionRate = subscriptionDetails.rate;
  const router = useRouter();
  const billingPage = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL!;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
       <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
  <TabsTrigger
    value="calculator"
    className="flex items-center justify-center sm:justify-start space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
  >
    <Calculator className="h-4 w-4" />
    <span className="hidden sm:inline">Calculator</span>
  </TabsTrigger>
  <TabsTrigger
    value="invoices"
    className="flex items-center justify-center sm:justify-start space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
  >
    <FileText className="h-4 w-4" />
    <span className="hidden sm:inline">Invoices</span>
  </TabsTrigger>
  <TabsTrigger
    value="profile"
    className="flex items-center justify-center sm:justify-start space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
  >
    <User className="h-4 w-4" />
    <span className="hidden sm:inline">Profile</span>
  </TabsTrigger>
  <TabsTrigger
    value="subscription"
    className="flex items-center justify-center sm:justify-start space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
  >
    <Settings className="h-4 w-4" />
    <span className="hidden sm:inline">Subscription</span>
  </TabsTrigger>
</TabsList>

    


        <TabsContent value="profile">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      {Math.round(commissionRate * 100)}% Commission Plan
                    </h3>
                    <p className="text-blue-700 mt-1">
                      ${subscriptionPrice}/month
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      You earn {Math.round(commissionRate * 100)}% commission on
                      every deal profit
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Subscription Benefits
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Advanced deal calculator</li>
                    <li>• Monthly invoice management</li>
                    <li>• Personal dashboard access</li>
                    <li>• Sales training materials</li>
                    <li>• Commission optimization tools</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Billing Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Next billing: January 15, 2024</p>
                    <p>Payment method: •••• 4242</p>
                    <p>Billing email: {user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex space-x-4 flex-wrap ">
                  <Button
                    variant="outline"
                    onClick={() => router.push(billingPage)}
                  >
                    Upgrade Plan
                  </Button>
                  <Button variant="outline">Update Payment</Button>
                  <Button variant="outline"      className="mt-2"   >Download Invoice</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MainSection;
