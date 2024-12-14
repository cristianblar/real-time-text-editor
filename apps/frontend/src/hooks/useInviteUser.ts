import type { AxiosError } from "axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { DocumentPermission } from "@repo/types";
import { inviteUser } from "@/web-lib/api/collaboration";

export const useInviteUser = (
  options: Partial<
    UseMutationOptions<
      void,
      AxiosError,
      { documentId: string; email: string; permission: DocumentPermission },
      unknown
    >
  > = {},
) => {
  const inviteUserMutation = useMutation({
    mutationFn: inviteUser,
    ...options,
  });

  return {
    inviteUser: inviteUserMutation.mutateAsync,
    isLoading: inviteUserMutation.isPending,
  };
};
