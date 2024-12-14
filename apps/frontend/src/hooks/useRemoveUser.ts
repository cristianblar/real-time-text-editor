import type { AxiosError } from "axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { removeUser } from "@/web-lib/api/collaboration";

export const useRemoveUser = (
  options: Partial<
    UseMutationOptions<
      void,
      AxiosError,
      { documentId: string; email: string },
      unknown
    >
  > = {},
) => {
  const removeUserMutation = useMutation({
    mutationFn: removeUser,
    ...options,
  });

  return {
    removeUser: removeUserMutation.mutateAsync,
    isLoading: removeUserMutation.isPending,
  };
};
