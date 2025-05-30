"use client";
import { useState } from "react";
import { useUserQueries } from "@/queries/user-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Mail, User, Building, Clock } from "lucide-react";
import { ProfileBreadcrumb } from "./profile-breadcrumb";

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { useUserProfile } = useUserQueries();

  const { data: profileData, isLoading, error } = useUserProfile();

  const handlePasswordReset = () => {
    window.open("https://your-zitadel-instance.com/ui/login/reset", "_blank");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-emerald-700 font-medium">
          Loading your profile...
        </p>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p>
            We couldn&apos;t load your profile information. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="mx-auto p-4 animate-fade-in">
      <div className="w-full mx-auto">
        <ProfileBreadcrumb activeTab={activeTab} />

        <div className="border-slate-200 rounded-xl p-1">
          <Tabs
            defaultValue="profile"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="profile" className="rounded-md">
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-md">
                <Lock className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-slate-200 shadow-md">
                        {profileData?.image ? (
                          <AvatarImage
                            src={profileData?.image || "/placeholder.svg"}
                            alt={profileData?.name || "User"}
                          />
                        ) : (
                          <AvatarFallback className="bg-green-950 text-white text-2xl">
                            {getInitials(profileData?.name ?? "U")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                        {profileData?.name || "Unnamed User"}
                      </CardTitle>
                      <CardDescription className="text-base mb-3">
                        {profileData?.email}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="bg-slate-50 border-slate-200 text-primary py-1 px-3 rounded-full"
                        >
                          {profileData?.userType}
                        </Badge>
                        {profileData?.organizationName && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-primary py-1 px-3 rounded-full"
                          >
                            {profileData?.organizationName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="my-2" />

                <CardContent className="pt-6 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Email Address
                        </h3>
                        <p className="text-base font-medium">
                          {profileData?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          User Type
                        </h3>
                        <p className="text-base font-medium">
                          {profileData?.userType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Organization
                        </h3>
                        <p className="text-base font-medium">
                          {profileData?.organizationName || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Member Since
                        </h3>
                        <p className="text-base font-medium">
                          {profileData?.createdAt
                            ? new Date(
                                profileData?.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="border-none ">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security settings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="mb-4" />

                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg border border-gray-100">
                    <h3 className="text-base font-medium ">
                      Password Management
                    </h3>
                    <p className="text-sm  mt-1 mb-3">
                      We recommend changing your password regularly to maintain
                      account security
                    </p>
                    <Button
                      onClick={handlePasswordReset}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      <Lock className="mr-2 h-4 w-4" /> Reset Password
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start pt-2 pb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your account security is important to us. If you notice any
                    suspicious activity, please contact support immediately.
                  </p>
                  <Button variant="link" className="text-emerald-700 p-0">
                    View Recent Login Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
