import { FormEvent, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/web-lib/api/auth";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
  });

  const handleLogout = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await logoutMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["check-session"] });
      router.push("/");
    },
    [logoutMutation, queryClient, router],
  );

  return {
    handleLogout,
    isPending: logoutMutation.isPending,
  };
};
