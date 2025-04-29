"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { SiZoho } from "react-icons/si";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Building, 
  Phone,
  ArrowRight,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

// Form schema with validation
const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(2, { message: "Company name is required" }),
  jobTitle: z.string().min(2, { message: "Job title is required" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

// Mock signup service
const authService = {
  signup: async (data: SignupFormValues): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Signup data:", data);
    return { success: true, message: "Account created successfully" };
  },
  signupWithZoho: async (): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Signing up with Zoho");
    return { success: true, message: "Zoho authentication successful" };
  }
};

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      router.push('/verify-email');
    },
  });

  // Zoho signup mutation
  const zohoSignupMutation = useMutation({
    mutationFn: authService.signupWithZoho,
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  // Form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      jobTitle: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Form submission handler
  const onSubmit = (data: SignupFormValues) => {
    return signupMutation.mutateAsync(data);
  };

  // Handle Zoho SSO
  const handleZohoSSO = () => {
    zohoSignupMutation.mutate();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-8 lg:px-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              M&A Intelligence
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Create your account to get started
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="name@example.com" 
                          type="email"
                          {...field} 
                        />
                        <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Your company name" {...field} />
                        <Building className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                          <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Create a password" 
                          {...field} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm your password" 
                          {...field} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-emerald-900 hover:bg-emerald-700"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleZohoSSO}
                className="w-full"
                disabled={zohoSignupMutation.isPending}
              >
                {zohoSignupMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SiZoho className="mr-2 h-4 w-4 text-blue-600" />
                )}
                Sign up with Zoho
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Side - Green Banner */}
      <div className="hidden md:flex flex-1 flex-col justify-center bg-emerald-900 px-8 py-12 text-white">
        <div className="mx-auto max-w-md">
          <h2 className="text-3xl text-center font-bold">
            Faster Audits, Smarter Decisions
          </h2>
          <p className='mt-4 text-xl text-center font-light text-gray-200 opacity-90 before:content-[""] after:content-[""]'>
            Automate audits in seconds and make faster, smarter decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;