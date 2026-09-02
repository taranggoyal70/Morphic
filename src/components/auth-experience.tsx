import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

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

const path = [
  ["01", "Map repository", "Ready"],
  ["02", "Resolve dependencies", "Ready"],
  ["03", "Choose implementation path", "Decision"],
  ["04", "Open isolated run", "Queued"],
];

export function AuthExperience({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  return (
    <main className="morphic-auth-shell">
      <section className="morphic-auth-story" aria-labelledby="morphic-auth-title">
        <Brand className="morphic-auth-brand" />
        <div className="morphic-auth-copy">
          <p>Adaptive workspace for builders</p>
          <h1 id="morphic-auth-title">Start with the outcome.<br /><span>Keep the path visible.</span></h1>
          <small>Morphic grounds an objective in your repository, surfaces the decisions, and keeps approved Codex work moving toward a pull request.</small>
        </div>
        <div className="morphic-auth-objective">
          <div className="morphic-auth-objective-head"><span>Active objective</span><strong>Ship onboarding by Friday</strong><i>On track</i></div>
          <div className="morphic-auth-path">
            {path.map(([number, label, status]) => <div key={number}><code>{number}</code><span>{label}</span><b className={status === "Decision" ? "is-decision" : ""}>{status}</b></div>)}
          </div>
          <div className="morphic-auth-run"><span>◇</span><div><strong>Codex run awaiting approval</strong><small>isolated sandbox · branch + draft PR</small></div><button type="button">Review</button></div>
        </div>
      </section>
      <section className="morphic-auth-form" aria-label={isSignUp ? "Create Morphic account" : "Sign in to Morphic"}>
        <div className="morphic-auth-mobile-brand"><Brand /></div>
        <p className="morphic-auth-form-kicker">{isSignUp ? "Create workspace access" : "Resume your workspace"}</p>
        {isSignUp ? <SignUp appearance={appearance} /> : <SignIn appearance={appearance} />}
        <Link href="/" className="morphic-auth-back">← Return to product overview</Link>
      </section>
    </main>
  );
}
