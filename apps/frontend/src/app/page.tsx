"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Skeleton } from "@/web/components/ui/skeleton";
import { useAuth } from "../hooks/useAuth";
import { useCheckSession } from "../hooks/useCheckSession";
import AuthForm from "../components/auth-form";

export default function AuthPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signin, signup, isLoading } = useAuth();

  const { isLoading: isCheckingSession, isSuccess: isAuthenticated } =
    useCheckSession();

  if (isCheckingSession) {
    return (
      <div className="container flex items-center justify-center h-screen w-screen">
        <Skeleton className="h-390 w-350" />
      </div>
    );
  }

  if (isAuthenticated) {
    return router.push("/documents");
  }

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      if (mode === "signin") {
        setSuccessMessage(null);
        await signin(data);
        queryClient.invalidateQueries({ queryKey: ["check-session"] });
        queryClient.cancelQueries();
        router.push("/documents");
      } else {
        setSuccessMessage(null);
        await signup(data);
        setSuccessMessage(
          "Sign up successful! Please sign in with your new account.",
        );
        setMode("signin");
      }
    } catch (error) {
      setSuccessMessage(null);
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <AuthForm
        mode={mode}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        successMessage={successMessage}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Don't have an account? "
          : "Already have an account? "}
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </Button>
      </div>
    </div>
  );
}
