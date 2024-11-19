import { TextField } from "@mui/material";
import AuthForm from "./card";
import AuthLayout from "./layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../services/axios-instance";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login } = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, status } = await axiosInstance.post<{
        _id: string;
        guest: {
          _id: string;
          account?: {
            _id: string;
            name: string;
            email: string;
          };
        };
      }>("/auth/login", {
        email,
        password,
      });

      switch (status) {
        case 200:
        case 201:
          queryClient.setQueryData(["guest", "account"], data.guest.account);

          delete data.guest.account;

          queryClient.setQueryData(["guest"], data);

          enqueueSnackbar({
            variant: "success",
            message: "Successfully loggedin",
          });

          sessionStorage.setItem("token", data._id);

          navigate("/");
          return data;
        case 400:
          enqueueSnackbar({
            variant: "error",
            message: "Incorrect Credentials",
          });
          break;
        case 500:
          enqueueSnackbar({
            variant: "error",
            message: "Server Error",
          });
      }

      throw new Error();
    },
  });

  return (
    <AuthLayout>
      <AuthForm
        header={"Login"}
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.currentTarget);

          login({
            email: formData.get("email")!.toString(),
            password: formData.get("password")!.toString(),
          });
        }}
      >
        <TextField
          required
          label={"email"}
          variant={"standard"}
          placeholder={"xxx@x.com"}
          type="text"
          name={"email"}
        />
        <TextField
          required
          label={"password"}
          variant={"standard"}
          placeholder={"*******"}
          type="password"
          name={"password"}
        />
      </AuthForm>
    </AuthLayout>
  );
}
