import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Savora" },
      { name: "description", content: "Sign in or create your free Savora account." },
      { property: "og:title", content: "Sign in — Savora" },
      { property: "og:description", content: "Access your Savora recipe box and meal planner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function AuthPage() {
  const search = Route.useSearch();
  const mode: "signin" | "signup" | "forgot" = search.mode ?? "signin";

  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  useEffect(() => {
    if (!loading && session && pathname === "/auth") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate, pathname]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (mode === "forgot") {
      const parsedEmail = z.string().trim().email().safeParse(email);
      if (!parsedEmail.success) {
        toast.error("Enter a valid email address");
        return;
      }
      setPending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setPending(false);
      if (error) toast.error(error.message);
      else toast.success("Password reset link sent — check your inbox");
      return;
    }

    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setPending(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName.trim() },
        },
      });
      setPending(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setAwaitingConfirm(true);
        toast.success("Account created — confirm your email to continue");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back");

  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  const copy = {
    signin: { title: "Welcome back", description: "Sign in to your recipe box." },
    signup: { title: "Create your account", description: "Start organising in under a minute." },
    forgot: { title: "Reset your password", description: "We'll email you a secure link." },
  }[mode];

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center justify-center gap-2.5">
          <span className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Savora</span>
        </Link>

        <Card className="shadow-lift">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {awaitingConfirm ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
                  account, then sign in.
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setAwaitingConfirm(false);
                    navigate({ to: "/auth", search: { mode: "signin" } });
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Your name</Label>
                      <Input
                        id="fullName"
                        autoComplete="name"
                        maxLength={80}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "signup"
                      ? "Create account"
                      : mode === "forgot"
                        ? "Send reset link"
                        : "Sign in"}
                  </Button>
                </form>

                {mode !== "forgot" && (
                  <>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogle}>
                      Continue with Google
                    </Button>
                  </>
                )}

                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  {mode === "signin" && (
                    <>
                      <p>
                        <Link
                          to="/auth"
                          search={{ mode: "forgot" }}
                          className="hover:text-foreground"
                        >
                          Forgot your password?
                        </Link>
                      </p>
                      <p>
                        New here?{" "}
                        <Link
                          to="/auth"
                          search={{ mode: "signup" }}
                          className="font-medium text-primary hover:underline"
                        >
                          Create an account
                        </Link>
                      </p>
                    </>
                  )}
                  {mode !== "signin" && (
                    <p>
                      <Link
                        to="/auth"
                        search={{ mode: "signin" }}
                        className="font-medium text-primary hover:underline"
                      >
                        Back to sign in
                      </Link>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
