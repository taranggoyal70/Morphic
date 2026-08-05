import type { Metadata } from "next";

import { AuthExperience } from "@/components/auth-experience";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return <AuthExperience mode="sign-in" />;
}
