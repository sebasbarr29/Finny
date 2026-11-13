"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "./actions";

export default function AuthForm({ mode, notice }: { mode: "login" | "signup"; notice?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const isSignup = mode === "signup";

  return (
    <form action={action} className="auth-form" noValidate>
      {notice && !state.error && <p className="form-notice" role="status">{notice}</p>}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      {isSignup && (
        <label className="field">
          <span>Business name <em>(optional)</em></span>
          <input id="name" name="name" type="text" autoComplete="organization" defaultValue={state.name} maxLength={100} />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {isSignup && <small>At least 8 characters.</small>}
      </label>

      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
      </button>

      <p className="auth-switch">
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New to Finny? <Link href="/signup">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
