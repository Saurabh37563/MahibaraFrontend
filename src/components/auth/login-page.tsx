"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { SiZoho } from "react-icons/si";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 lg:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              M&A Intelligence
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please sign in with your Zoho account
            </p>
          </div>

          {/* 
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            ...existing code for normal login form...
          </form>
          */}

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  Sign in with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                signIn("zoho", {
                  callbackUrl: "/agents",
                  redirect: true,
                })
              }
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <SiZoho className="mr-2 h-4 w-4 text-blue-600" />
              Sign in with Zoho
            </button>
          </div>
        </div>
      </div>

      <div className=" flex-1 hidden md:flex flex-col justify-center bg-emerald-900 px-8 py-12 text-white">
        <div className="mx-auto max-w-md">
          <h2 className="text-3xl text-center font-bold">
            Faster Audits, Smarter Decisions
          </h2>
          <p className="mt-4 text-xl text-center font-light text-gray-200 opacity-90 before:content-['“'] after:content-['”']">
            Automate audits in seconds and make faster, smarter decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
