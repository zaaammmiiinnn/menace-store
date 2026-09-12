'use client';

import { useUser, useAuth as useClerkAuthCore, useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import type { AuthUser, AuthSession, OAuthProvider, SignInResult, SignUpResult, PasswordResetResult } from './types';

// Map Clerk errors to Menace tone
export function mapClerkError(err: unknown): string {
  if (!err) return "SOMETHING'S OFF. TRY AGAIN.";

  const anyErr = err as { errors?: Array<{ code?: string; message?: string }> };
  const firstCode = anyErr.errors?.[0]?.code;
  const firstMsg = anyErr.errors?.[0]?.message;

  switch (firstCode) {
    case 'form_identifier_not_found':
      return "No account with that email. Hit sign up.";
    case 'form_password_incorrect':
      return "Wrong password. Happens. Try again or reset.";
    case 'form_code_incorrect':
      return "That code doesn't match. Check again.";
    case 'form_identifier_exists':
      return "Account already exists. Back for more? Sign in.";
    case 'form_password_pwned':
      return "Password is too common. Make it punchier.";
    case 'form_param_format_invalid':
      return "That email's not right.";
    case 'session_exists':
      return "Already logged in.";
    case 'verification_expired':
      return "Code expired. Request a fresh one.";
    default:
      return firstMsg || "SOMETHING'S OFF. TRY AGAIN.";
  }
}

export function useClerkAuth() {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { userId, isSignedIn } = useClerkAuthCore();
  const clerk = useClerk();

  const email = (clerkUser?.primaryEmailAddress?.emailAddress || '').toLowerCase();
  const metadataRole = (clerkUser?.publicMetadata?.role as string) || null;
  const adminEmailsEnv = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    'zamin@menace.store,admin@menace.store,zaminaskari.work@gmail.com,askarizamin110@gmail.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isEmailAdmin = email ? adminEmailsEnv.includes(email) : false;
  const devBypass = process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === 'true';
  const role = metadataRole || (isEmailAdmin ? 'admin' : 'customer');
  const isAdmin = role === 'admin' || role === 'staff' || isEmailAdmin || devBypass;

  const user: AuthUser | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'MENACE MEMBER',
    imageUrl: clerkUser.imageUrl,
    role,
    isAdmin,
    createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : null,
  } : null;

  const session: AuthSession = {
    userId: userId || null,
    isAuthenticated: !!isSignedIn,
    isLoading: !userLoaded,
  };

  const signOut = async () => {
    try {
      await clerk.signOut({ redirectUrl: '/' });
    } catch {
      window.location.href = '/';
    }
  };

  return {
    user,
    session,
    isAuthenticated: !!isSignedIn,
    isLoading: !userLoaded,
    signOut,
  };
}

export function useClerkSignIn() {
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithPassword = async (email: string, password: string): Promise<SignInResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing. Try in a sec." };
    }
    setIsLoading(true);
    try {
      const result = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        return { success: true };
      } else if (result.status === 'needs_second_factor' || result.status === 'needs_first_factor') {
        return { success: false, needsVerification: true };
      } else {
        return { success: false, error: "Verification needed to continue." };
      }
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider, redirectUrl?: string): Promise<void> => {
    if (!clerk.loaded) return;
    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_apple';
    const targetRedirect = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/account';

    try {
      if (clerk.client?.signIn) {
        await clerk.client.signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: targetRedirect,
          continueSignUp: true,
        });
      }
    } catch (err) {
      console.error('OAuth redirect error:', err);
      throw err;
    }
  };

  const signInWithMagicLink = async (email: string): Promise<SignInResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing." };
    }
    setIsLoading(true);
    try {
      const signInAttempt = await clerk.client.signIn.create({
        identifier: email,
      });

      const emailFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'email_link'
      ) as { emailAddressId?: string } | undefined;

      const emailAddressId = emailFactor?.emailAddressId;

      if (!emailAddressId) {
        return { success: false, error: "No email address found for magic link." };
      }

      await clerk.client.signIn.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId,
        redirectUrl: window.location.origin + '/account',
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing." };
    }
    setIsLoading(true);
    try {
      await (clerk.client.signIn.create as unknown as (params: { strategy: string; identifier: string }) => Promise<unknown>)({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (code: string, newPassword: string): Promise<PasswordResetResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing." };
    }
    setIsLoading(true);
    try {
      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: "Couldn't reset. Try requesting another code." };
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithPassword,
    signInWithOAuth,
    signInWithMagicLink,
    sendPasswordReset,
    resetPassword,
    isLoading,
  };
}

export function useClerkSignUp() {
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const signUpWithPassword = async (email: string, password: string, firstName: string): Promise<SignUpResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing." };
    }
    setIsLoading(true);
    try {
      await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName,
      });

      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      return { success: true, needsVerification: true };
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (code: string): Promise<SignUpResult> => {
    if (!clerk.loaded || !clerk.client) {
      return { success: false, error: "Auth initializing." };
    }
    setIsLoading(true);
    try {
      const result = await clerk.client.signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: "Verification didn't finish. Check the code." };
    } catch (err) {
      return { success: false, error: mapClerkError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async (): Promise<boolean> => {
    if (!clerk.loaded || !clerk.client) return false;
    try {
      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      return true;
    } catch {
      return false;
    }
  };

  const signUpWithOAuth = async (provider: OAuthProvider, redirectUrl?: string): Promise<void> => {
    if (!clerk.loaded) return;
    const strategy = provider === 'google' ? 'oauth_google' : 'oauth_apple';
    const targetRedirect = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/account';

    try {
      if (clerk.client?.signUp) {
        await clerk.client.signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: targetRedirect,
          continueSignUp: true,
        });
      } else if (clerk.client?.signIn) {
        await clerk.client.signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: targetRedirect,
          continueSignUp: true,
        });
      }
    } catch (err) {
      console.error('OAuth signup error:', err);
      throw err;
    }
  };

  return {
    signUpWithPassword,
    signUpWithOAuth,
    verifyEmailCode,
    resendVerificationCode,
    isLoading,
  };
}
