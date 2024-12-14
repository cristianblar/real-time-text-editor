import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { User } from "@repo/types";
import { signin as apiSignIn, signup as apiSignUp } from "../../lib/api/auth";
import { AxiosError } from "axios";

export function useAuth(
  options: Partial<
    UseMutationOptions<Pick<User, "email">, AxiosError, User, unknown>
  > = {},
) {
  const signinMutation = useMutation({
    mutationFn: apiSignIn,
    ...options,
  });

  const signupMutation = useMutation({
    mutationFn: apiSignUp,
    ...options,
  });

  return {
    signin: signinMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    isLoading: signinMutation.isPending || signupMutation.isPending,
  };
}
