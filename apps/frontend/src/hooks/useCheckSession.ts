import { useQuery } from "@tanstack/react-query";
import { checkSession } from "@/web-lib/api/auth";

export const useCheckSession = () => {
  return useQuery({
    queryKey: ["check-session"],
    queryFn: checkSession,
    retry: false,
  });
};
