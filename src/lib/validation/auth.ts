import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email's required.")
    .email("That email's not right."),
  password: z
    .string()
    .min(1, "Password's required."),
  rememberMe: z.boolean(),
});

export const magicLinkSchema = z.object({
  email: z
    .string()
    .min(1, "Email's required.")
    .email("That email's not right."),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Need a name to call you.")
      .max(50, "Name's too long."),
    email: z
      .string()
      .min(1, "Email's required.")
      .email("That email's not right."),
    password: z
      .string()
      .min(8, "Needs at least 8 characters.")
      .regex(/[A-Z]/, "Needs an uppercase letter.")
      .regex(/[0-9]/, "Needs at least one number."),
    confirmPassword: z
      .string()
      .min(1, "Confirm your password."),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "Must accept the terms to get in."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match. Try again.",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email's required.")
    .email("That email's not right."),
});

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(6, "Code's 6 digits.")
      .max(6, "Code's 6 digits."),
    newPassword: z
      .string()
      .min(8, "Needs at least 8 characters.")
      .regex(/[A-Z]/, "Needs an uppercase letter.")
      .regex(/[0-9]/, "Needs at least one number."),
    confirmPassword: z
      .string()
      .min(1, "Confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match. Try again.",
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, "Code's 6 digits.")
    .max(6, "Code's 6 digits."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
