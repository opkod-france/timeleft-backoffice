"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { setAuthenticated } from "@/components/protected-route";

const DEMO_EMAIL = "admin@timeleft.com";
const DEMO_PASSWORD = "timeleft2025";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    if (data.email !== DEMO_EMAIL || data.password !== DEMO_PASSWORD) {
      setError("root", { message: "Invalid credentials. Use the demo account below." });
      return;
    }

    setAuthenticated(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/events");
  };

  const fillDemo = () => {
    setValue("email", DEMO_EMAIL);
    setValue("password", DEMO_PASSWORD);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Theme toggle — top right */}
      <div className="fixed right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://timeleft.com/fr/wp-content/uploads/sites/6/2023/08/logo_black.svg"
            alt="Timeleft"
            className="h-8 dark:brightness-0 dark:invert"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Email
            </label>
            <input
              {...register("email", { required: "Email is required" })}
              id="email"
              type="email"
              placeholder="you@timeleft.com"
              autoComplete="email"
              className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs text-brand-pink hover:text-brand-pink/80 transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                {...register("password", { required: "Password is required" })}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 pr-10 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeSlash className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Root error (invalid credentials) */}
          {errors.root && (
            <p className="text-sm text-destructive animate-fade-in">{errors.root.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-lg hover:shadow-foreground/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Demo Account
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="rounded-full bg-brand-pink/10 px-2.5 py-1 text-[11px] font-medium text-brand-pink transition-colors hover:bg-brand-pink/20 dark:bg-brand-pink/15"
            >
              Auto-fill
            </button>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/50 w-12">Email</span>
              <code className="font-data text-foreground/70">admin@timeleft.com</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/50 w-12">Pass</span>
              <code className="font-data text-foreground/70">timeleft2025</code>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/40">
          v0.0.0-development
        </p>
      </div>
    </div>
  );
}
