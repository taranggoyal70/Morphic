import {
  CheckCircleIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

const route = [
  {
    icon: GitBranchIcon,
    label: "Repository evidence stored",
    detail: "Files · issues · pull requests",
  },
  {
    icon: WarningCircleIcon,
    label: "Decisions kept in the path",
    detail: "Nothing hidden behind an agent run",
  },
  {
    icon: ShieldCheckIcon,
    label: "Execution waits for approval",
    detail: "Isolated branch · draft pull request",
  },
];

export function AuthRoutePreview() {
  return (
    <div className="morphic-auth-route" aria-label="Morphic product guarantees">
      <div className="morphic-auth-route-head">
        <span>What happens next</span>
        <strong>
          <CheckCircleIcon size={14} weight="fill" />
          You stay in control
        </strong>
      </div>
      <ol>
        {route.map((step, index) => (
          <li key={step.label}>
            <span className="morphic-auth-route-number">0{index + 1}</span>
            <step.icon size={18} weight="duotone" />
            <div>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
