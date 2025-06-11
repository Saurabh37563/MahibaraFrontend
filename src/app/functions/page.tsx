"use client";

import TeamDashboard from "@/components/functions";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <TeamDashboard />
    </Suspense>
  );
};

export default Page;
