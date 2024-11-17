import { useSuspenseQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance";

export default function GuestProvider({ children }) {
  useSuspenseQuery({
    queryKey: ["guest"],
    queryFn: async () => {
      const tokenId = sessionStorage.getItem("token");

      const { data, status } = await axiosInstance.get<{
        _id: string;
        guest: { _id: string };
      }>("/auth/getTemporaryGuest", {
        params: {
          id: tokenId,
        },
      });

      if (status === 200 || status === 201) {
        sessionStorage.setItem("token", data._id);
        return data;
      }

      throw new Error();
    },
    retry: (failureCount, error) => failureCount < 5 && !!error,
  });

  return children;
}
