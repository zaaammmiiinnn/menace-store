'use client';

import { useClerkAuth, useClerkSignIn, useClerkSignUp } from './clerk';
export * from './types';
export * from './clerk';

// Primary auth hook exports through the adapter pattern
export function useAuth() {
  return useClerkAuth();
}

export function useSignIn() {
  return useClerkSignIn();
}

export function useSignUp() {
  return useClerkSignUp();
}
