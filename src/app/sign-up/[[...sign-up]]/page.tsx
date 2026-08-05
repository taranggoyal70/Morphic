import type { Metadata } from "next";

import { AuthExperience } from "@/components/auth-experience";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return <AuthExperience mode="sign-up" />;
}
