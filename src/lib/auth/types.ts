export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
  createdAt?: Date | string | null;
}

export interface AuthSession {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type OAuthProvider = 'google' | 'apple';

export interface SignInResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

export interface PasswordResetResult {
  success: boolean;
  error?: string;
}

export interface AuthAdapter {
  useAuth: () => {
    user: AuthUser | null;
    session: AuthSession;
    isAuthenticated: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
  };
  useSignIn: () => {
    signInWithPassword: (email: string, password: string) => Promise<SignInResult>;
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
    signInWithMagicLink: (email: string) => Promise<SignInResult>;
    sendPasswordReset: (email: string) => Promise<PasswordResetResult>;
    resetPassword: (code: string, newPassword: string) => Promise<PasswordResetResult>;
    isLoading: boolean;
  };
  useSignUp: () => {
    signUpWithPassword: (email: string, password: string, firstName: string) => Promise<SignUpResult>;
    verifyEmailCode: (code: string) => Promise<SignUpResult>;
    resendVerificationCode: () => Promise<boolean>;
    isLoading: boolean;
  };
}
