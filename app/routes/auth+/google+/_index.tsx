import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { ButtonHTMLAttributes } from "react";

import { useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { clsx } from "clsx";

import { Icon } from "~/components/icon.tsx";
import { authenticator } from "~/utils/auth.server.ts";

export const loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("google", request);
};

export function GoogleLoginForm() {
  const fetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "google-login-form",
    lastSubmission: fetcher.data?.submission
  });

  return (
    <fetcher.Form action="/auth/google" method="POST" {...form.props}>
      <GoogleLoginButton className="mt-4" state={fetcher.state} />
    </fetcher.Form>
  );
}

interface GoogleLoginButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "idle" | "loading" | "submitting";
  title?: string;
}

export function GoogleLoginButton({
  disabled,
  state = "idle",
  title = "Sign in with Google",
  ...props
}: GoogleLoginButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        props.className,
        "inline-flex items-center rounded bg-[#4285f4] px-4 py-2 font-semibold text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-75"
      )}
      disabled={disabled || state !== "idle"}
    >
      <Icon className={clsx("mr-2 h-8 w-8 text-white")} name="google" />
      <span>{title}</span>
    </button>
  );
}
