import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { AuthRoutePreview } from "@/components/auth-route-preview";
import { Brand } from "@/components/brand";

const appearance = {
  variables: {
    colorPrimary: "#78dce8",
    colorBackground: "#0b1826",
    colorInputBackground: "#102235",
    colorInputText: "#f3f0e8",
    colorText: "#f3f0e8",
    colorTextSecondary: "#9eb0bf",
    borderRadius: "10px",
  },
  elements: {
    rootBox: "morphic-auth-clerk-root",
    cardBox: "morphic-auth-clerk-box",
    card: "morphic-auth-clerk-card",
    headerTitle: "morphic-auth-clerk-title",
    headerSubtitle: "morphic-auth-clerk-subtitle",
    socialButtonsBlockButton: "morphic-auth-social",
    formFieldInput: "morphic-auth-input",
    formButtonPrimary: "morphic-auth-submit",
  },
} as const;

export function AuthExperience({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  return (
    <main id="main-content" className="morphic-auth-shell">
      <section className="morphic-auth-story" aria-labelledby="morphic-auth-title">
        <Brand className="morphic-auth-brand" />
        <div className="morphic-auth-copy">
          <p>Repository facts in. Reviewable work out.</p>
          <h1 id="morphic-auth-title">Your next objective,<br /><span>with its evidence attached.</span></h1>
          <small>Connect GitHub to build a workspace from live repository evidence. Morphic keeps decisions visible and waits for approval before Codex runs.</small>
        </div>
        <AuthRoutePreview />
      </section>
      <section className="morphic-auth-form" aria-label={isSignUp ? "Create Morphic account" : "Sign in to Morphic"}>
        <div className="morphic-auth-mobile-brand"><Brand /></div>
        <p className="morphic-auth-form-kicker">{isSignUp ? "Connect your first repository" : "Return to your objectives"}</p>
        {isSignUp ? <SignUp appearance={appearance} /> : <SignIn appearance={appearance} />}
        <Link href="/" className="morphic-auth-back">← Back to Morphic overview</Link>
      </section>
    </main>
  );
}
