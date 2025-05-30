"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

// Form schemas
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "Please enter a valid 6-digit OTP" }),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type definitions
type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpParams {
  email: string;
  otp: string;
}

interface ResetPasswordParams {
  email: string;
  password: string;
}

// Mock API service functions
const forgotPasswordService = {
  requestReset: async (_email: string): Promise<ResetResponse> => {
    // Simulate API call
    console.log(`Requesting password reset for email: ${_email}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "OTP sent successfully" };
  },
  verifyOtp: async (_params: VerifyOtpParams): Promise<ResetResponse> => {
    // Simulate API call
    console.log(
      `Verifying OTP for email: ${_params.email}, OTP: ${_params.otp}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "OTP verified successfully" };
  },
  resetPassword: async (
    _params: ResetPasswordParams
  ): Promise<ResetResponse> => {
    // Simulate API call
    console.log(
      `Resetting password for email: ${_params.email}, New Password: ${_params.password}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, message: "Password reset successfully" };
  },
};

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Request password reset mutation
  const requestResetMutation = useMutation({
    mutationFn: forgotPasswordService.requestReset,
    onSuccess: () => {
      setStep(2);
      setResendTimer(30);
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: forgotPasswordService.verifyOtp,
    onSuccess: () => {
      setStep(3);
    },
    onError: () => {
      setOtpError(true);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: forgotPasswordService.resetPassword,
    onSuccess: () => {
      setStep(4);
    },
  });

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handlers
  const handleEmailSubmit = (data: EmailFormValues): Promise<ResetResponse> => {
    setEmail(data.email);
    return requestResetMutation.mutateAsync(data.email);
  };

  const handleOtpSubmit = (): Promise<ResetResponse> => {
    const otpString = otpValues.join("");
    if (otpString.length !== 6) {
      return Promise.reject(new Error("Please enter a valid 6-digit OTP"));
    }
    return verifyOtpMutation.mutateAsync({ email, otp: otpString });
  };

  const handleResetPasswordSubmit = (
    data: ResetPasswordFormValues
  ): Promise<ResetResponse> => {
    return resetPasswordMutation.mutateAsync({
      email,
      password: data.password,
    });
  };

  const handleResend = async () => {
    if (resendTimer === 0) {
      setOtpValues(new Array(6).fill(""));
      setOtpError(false);
      await requestResetMutation.mutateAsync(email);
    }
  };

  // OTP input handlers
  const handleOtpChange = useCallback(
    (element: HTMLInputElement, index: number) => {
      if (isNaN(Number(element.value))) return;

      const newOtpValues = [...otpValues];
      newOtpValues[index] = element.value;
      setOtpValues(newOtpValues);

      if (element.value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1]?.focus();
      }

      if (otpError) {
        setOtpError(false);
      }

      if (
        newOtpValues.every((val) => val !== "") &&
        newOtpValues.length === 6
      ) {
        // If all fields are filled, attempt submission
        otpForm.setValue("otp", newOtpValues.join(""));
      }
    },
    [otpValues, otpError, otpForm]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        if (
          otpValues[index] === "" &&
          index > 0 &&
          otpInputRefs.current[index - 1]
        ) {
          otpInputRefs.current[index - 1]?.focus();
        } else {
          const newOtpValues = [...otpValues];
          newOtpValues[index] = "";
          setOtpValues(newOtpValues);
        }
        if (otpError) {
          setOtpError(false);
        }
      }
    },
    [otpValues, otpError]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").trim();
      if (isNaN(Number(pastedData)) || pastedData.length !== 6) {
        return;
      }

      const pastedArray = pastedData.split("").slice(0, 6);
      setOtpValues(pastedArray);
      otpForm.setValue("otp", pastedArray.join(""));

      if (otpInputRefs.current[5]) {
        otpInputRefs.current[5]?.focus();
      }

      if (otpError) {
        setOtpError(false);
      }
    },
    [otpError, otpForm]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center pt-4">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "We'll send you an email with a verification code"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Create your new password"}
              {step === 4 && "Your password has been reset successfully"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Step 1: Email Form */}
            {step === 1 && (
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-emerald-900 hover:bg-emerald-700"
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending
                      ? "Sending..."
                      : "Send reset link"}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification code sent</AlertTitle>
                  <AlertDescription>
                    We&apos;ve sent a verification code to {email}
                  </AlertDescription>
                </Alert>

                {/* OTP Inputs */}
                <div>
                  <div className="text-sm font-medium mb-2">
                    Verification Code
                  </div>
                  <div className={`flex justify-between space-x-2 mb-2`}>
                    {otpValues.map((data, index) => (
                      <Input
                        key={index}
                        ref={(el: HTMLInputElement | null) => {
                          otpInputRefs.current[index] = el;
                          // do not return anything!
                        }}
                        type="text"
                        name="otp"
                        maxLength={1}
                        className={`w-full h-12 text-center border ${
                          otpError
                            ? "border-red-500 bg-red-50 text-red-900"
                            : "border-gray-300 bg-gray-50"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-lg`}
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={(e) => e.target.select()}
                        onPaste={(e) => handlePaste(e)}
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="text-sm text-red-500 mt-1">
                      Invalid OTP. Please check the code and try again.
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full bg-emerald-900 hover:bg-emerald-700"
                  disabled={
                    verifyOtpMutation.isPending ||
                    otpValues.some((v) => v === "") ||
                    otpValues.length !== 6
                  }
                  onClick={handleOtpSubmit}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify code"}
                </Button>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <Form {...resetPasswordForm}>
                <form
                  onSubmit={resetPasswordForm.handleSubmit(
                    handleResetPasswordSubmit
                  )}
                  className="space-y-6"
                >
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-emerald-900 hover:bg-emerald-700"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending
                      ? "Resetting..."
                      : "Reset password"}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-800" />
                </div>
                <div>
                  <h3 className="mt-2 text-lg font-medium">
                    Password reset successful
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your password has been reset successfully. You can now login
                    with your new password.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {step === 4 && (
            <CardFooter>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-emerald-900 hover:bg-emerald-700"
              >
                Return to login
              </Button>
            </CardFooter>
          )}

          {step === 2 && (
            <CardFooter className="flex justify-center">
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendTimer > 0 || requestResetMutation.isPending}
                className="text-emerald-700 hover:text-emerald-600"
              >
                {requestResetMutation.isPending
                  ? "Sending..."
                  : resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : "Didn't receive the code? Resend"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
