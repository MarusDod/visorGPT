import { TextField } from "@mui/material";
import AuthForm from "./card";
import AuthLayout from "./layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../services/axios-instance";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signUp } = useMutation({
    mutationFn: async ({
      email,
      name,
      password,
      confirmPassword,
    }: {
      email: string;
      name: string;
      password: string;
      confirmPassword: string;
    }) => {
      const { data, status } = await axiosInstance.post("/auth/createAccount", {
        name,
        email,
        password,
        confirmPassword,
      });

      switch (status) {
        case 201:
          queryClient.setQueryData(["guest", "account"], data);

          enqueueSnackbar({
            variant: "success",
            message: "Successfully signed up",
          });

          navigate("/");
          return data;
        case 400:
          enqueueSnackbar({
            variant: "error",
            message: data,
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
        header={"Sign Up"}
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.currentTarget);

          signUp({
            email: formData.get("email")!.toString(),
            name: formData.get("name")!.toString(),
            password: formData.get("password")!.toString(),
            confirmPassword: formData.get("confirmPassword")!.toString(),
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
          label={"name"}
          variant={"standard"}
          placeholder={"john smith"}
          type="text"
          name={"name"}
        />
        <TextField
          required
          label={"password"}
          variant={"standard"}
          placeholder={"*******"}
          type="password"
          name={"password"}
        />
        <TextField
          required
          label={"confirm password"}
          variant={"standard"}
          placeholder={"*******"}
          type="password"
          id={"confirmPassword"}
          name={"confirmPassword"}
          autoComplete="password"
        />
      </AuthForm>
    </AuthLayout>
  );
}
