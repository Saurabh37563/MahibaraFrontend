import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
}).nullable();

export const AuthContextSchema = z.object({
  user: UserSchema,
  setUser: z.function()
    .args(UserSchema)
    .returns(z.void()),
  token: z.string().nullable(),
  setToken: z.function()
    .args(z.string().nullable())
    .returns(z.void()),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  token: z.string(),
  expiresAt: z.string().datetime().optional(),
});


export const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});


export const RegisterFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export type User = z.infer<typeof UserSchema>;
export type AuthContextProps = z.infer<typeof AuthContextSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;


export const validateLoginForm = (data: unknown) => {
  return LoginFormSchema.safeParse(data);
};

export const validateRegisterForm = (data: unknown) => {
  return RegisterFormSchema.safeParse(data);
};

export const validateAuthResponse = (data: unknown) => {
  return AuthResponseSchema.safeParse(data);
};