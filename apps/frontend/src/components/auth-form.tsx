import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/web/components/ui/alert";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import Image from "next/image";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../constants";

type AuthFormProps = {
  mode: "signin" | "signup";
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  successMessage: string | null;
};

function AuthForm({
  mode,
  onSubmit,
  isLoading,
  successMessage,
}: AuthFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, "").trim();
  };

  const handleFormSubmit = async (data: {
    email: string;
    password: string;
  }) => {
    setServerError(null);
    const sanitizedData = {
      email: sanitizeInput(data.email),
      password: sanitizeInput(data.password),
    };
    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      setServerError(
        error instanceof AxiosError
          ? error.response?.data?.message ||
              error.response?.data ||
              "An unexpected error occurred"
          : "An unexpected error occurred",
      );
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <div className="flex justify-center">
          <Image priority src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>
        <CardTitle className="text-2xl text-center font-bold">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert variant="default" className="mb-4">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: PASSWORD_REGEX,
                    message:
                      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          {serverError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default AuthForm;
