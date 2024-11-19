import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Account } from "../../types";
import { axiosInstance } from "../axios-instance";

export default function GuestProvider({ children }) {
  const queryClient = useQueryClient();

  useSuspenseQuery({
    queryKey: ["guest"],
    queryFn: async () => {
      const tokenId = sessionStorage.getItem("token");

      const { data, status } = await axiosInstance.get<{
        _id: string;
        guest: {
          _id: string;
          account?: Account;
        };
      }>("/auth/getGuest", {
        params: {
          id: tokenId ? tokenId : null,
        },
      });

      if (status === 200 || status === 201) {
        sessionStorage.setItem("token", data._id);

        const account = data.guest.account;

        delete data.guest.account;

        if (account) {
          queryClient.setQueryData(["guest", "account"], account);
        }

        return data;
      }

      throw new Error();
    },
    retry: (failureCount, error) => failureCount < 5 && !!error,
    refetchOnMount: "always",
  });

  return children;
}
