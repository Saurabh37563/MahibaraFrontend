"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Mail, User, Building, Clock, ShieldCheck } from "lucide-react";
import { ProfileBreadcrumb } from "./profile-breadcrumb";
import { Loader } from "@/components/ui/loader";

type ProfileUser = {
  id?: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  loginName?: string | null;
  image?: string | null;
  userType?: string | null;
  organizationName?: string | null;
  createdAt?: string | null;
};

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: session, status } = useSession();

  const handlePasswordReset = () => {
    window.open(
      "https://auth.southguild.tech/ui/console/users/me?id=metadata",
      "_blank"
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen ">
        <Loader className="w-16 h-16 text-green-400" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-br from-green-900 to-green-800">
        <div className="bg-white shadow-lg border border-red-100 p-8 rounded-xl max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 text-red-600 rounded-full">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-2 text-green-900">
            Access Required
          </h2>
          <p className="text-slate-600 text-center mb-6">
            Please sign in to view your profile information.
          </p>
          <div className="flex justify-center">
            <Button className="bg-green-900 hover:bg-green-800 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Extract user fields with fallback/defaults
  const userSession = session.user as ProfileUser;

  const user: ProfileUser = {
    id: userSession.id,
    name: userSession.name,
    firstName: userSession.firstName,
    lastName: userSession.lastName,
    email: userSession.email,
    loginName: userSession.loginName,
    image: userSession.image,
    userType: userSession.userType || "user",
    organizationName: userSession.organizationName || "",
    createdAt: userSession.createdAt || "",
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full h-dvh min-h-screen p-4 md:p-6 lg:p-8 bg-transparent">
      <div className="w-full h-full">
        <ProfileBreadcrumb activeTab={activeTab} />

        <div className="mt-6 h-full">
          <Tabs
            defaultValue="profile"
            className="w-full h-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="w-full flex justify-center bg-transparent border border-gray-100 mb-6 gap-1">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-emerald-800/20 data-[state=active]:text-green-900 data-[state=active]:border-emerald-800/30 border px-6 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-green-900 transition-all"
                aria-label="Profile Tab"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setActiveTab("profile");
                }}
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-emerald-800/20 data-[state=active]:text-green-900 data-[state=active]:border-emerald-800/30 border px-6 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-green-900 transition-all"
                aria-label="Security Tab"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setActiveTab("security");
                }}
              >
                <Lock className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            {activeTab === "profile" ? (
              <div className="flex flex-col gap-6 w-full h-full ">
                <Card className="border py-0 bg-white shadow-lg rounded-xl overflow-hidden w-full">
                  <div className="bg-emerald-900 h-32"></div>
                  <div className="px-6 pb-6 -mt-16 flex flex-col items-center">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                      {user?.image ? (
                        <AvatarImage
                          src={user.image}
                          alt={user.name || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-emerald-950 text-white text-2xl font-semibold">
                          {getInitials(
                            user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.name
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-green-900 break-words whitespace-normal text-center w-full">
                      {(user.firstName || "") +
                        (user.lastName ? " " + user.lastName : "") ||
                        user.name ||
                        "Unnamed User"}
                    </h2>
                    <p className="text-slate-500 mt-1 break-words whitespace-normal text-center w-full">
                      {user.email}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {user.userType && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-800/20 border-emerald-800/30 text-green-900 py-1 px-3 rounded-full"
                        >
                          {user.userType}
                        </Badge>
                      )}
                      {user.organizationName && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 py-1 px-3 rounded-full"
                        >
                          {user.organizationName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border shadow-lg rounded-xl w-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-green-900">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      View and manage your personal details
                    </CardDescription>
                  </CardHeader>

                  <Separator />

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                              <Mail className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-500">
                                Email Address
                              </h3>
                              <p className="text-base font-medium text-slate-900 mt-1 break-words whitespace-normal">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-500">
                                Organization
                              </h3>
                              <p className="text-base font-medium text-slate-900 mt-1 break-words whitespace-normal">
                                {user?.organizationName || "Not assigned"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-500">
                                User Type
                              </h3>
                              <p className="text-base font-medium text-slate-900 mt-1 break-words whitespace-normal">
                                {user?.userType || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-slate-500">
                                Member Since
                              </h3>
                              <p className="text-base font-medium text-slate-900 mt-1 break-words whitespace-normal">
                                {user?.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )
                                  : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card
                  className={`${
                    activeTab === "profile" ? "lg:col-span-8" : "lg:col-span-12"
                  } bg-white border shadow-lg rounded-xl`}
                >
                  {activeTab === "profile" ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-green-900">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          View and manage your personal details
                        </CardDescription>
                      </CardHeader>

                      <Separator />

                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-slate-500">
                                    Email Address
                                  </h3>
                                  <p className="text-base font-medium text-slate-900 mt-1">
                                    {user?.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                                  <Building className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-slate-500">
                                    Organization
                                  </h3>
                                  <p className="text-base font-medium text-slate-900 mt-1">
                                    {user?.organizationName || "Not assigned"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                                  <User className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-slate-500">
                                    User Type
                                  </h3>
                                  <p className="text-base font-medium text-slate-900 mt-1">
                                    {user?.userType || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-emerald-800/20 text-green-900 rounded-md">
                                  <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-slate-500">
                                    Member Since
                                  </h3>
                                  <p className="text-base font-medium text-slate-900 mt-1">
                                    {user?.createdAt
                                      ? new Date(
                                          user.createdAt
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
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-800/20 text-green-900 rounded-lg">
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-green-900">
                              Security Settings
                            </CardTitle>
                            <CardDescription>
                              Manage your account security settings
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <Separator />

                      <CardContent className="py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 rounded-xl border border-green-200 bg-gradient-to-br from-emerald-800/20 to-white">
                            <h3 className="text-lg font-semibold text-green-900 mb-3">
                              Password Management
                            </h3>
                            <p className="text-slate-600 mb-6">
                              We recommend changing your password regularly to
                              maintain account security.
                            </p>
                            <Button
                              onClick={handlePasswordReset}
                              className="bg-green-950/95 hover:bg-green-900 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-green-900"
                              aria-label="Reset Password"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                  handlePasswordReset();
                              }}
                            >
                              <Lock className="mr-2 h-4 w-4" /> Reset Password
                            </Button>
                          </div>

                          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                            <h3 className="text-lg font-semibold text-green-900 mb-3">
                              Login Activity
                            </h3>
                            <p className="text-slate-600 mb-6">
                              Track and monitor recent sign-ins to your account.
                            </p>
                            <Button
                              variant="outline"
                              className="bg-white border-slate-200 text-green-900 hover:bg-green-50 focus-visible:ring-2 focus-visible:ring-green-900"
                              aria-label="View Recent Login Activity"
                              tabIndex={0}
                            >
                              View Recent Logins
                            </Button>
                          </div>
                        </div>

                        <div className="mt-8 p-4 bg-emerald-800/20 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="text-green-900 mt-1">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-green-900">
                                Security Note
                              </h4>
                              <p className="text-sm text-green-800 mt-1">
                                Your account security is important to us. If you
                                notice any suspicious activity, please contact
                                support immediately.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
