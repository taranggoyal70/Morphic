import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { requireMorphicUser } from "@/lib/auth";
import { listWorkspaces } from "@/lib/workspaces";

export default async function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMorphicUser();
  const workspaces = await listWorkspaces(user.id);

  return (
    <div className="min-h-screen bg-ink">
      <AppSidebar
        workspaces={workspaces.map(({ workspace, repository }) => ({
          id: workspace.id,
          objective: workspace.objective,
          status: workspace.status,
          repository: repository.fullName,
        }))}
      />
      <MobileHeader />
      <div className="min-h-screen lg:pl-[238px]">{children}</div>
    </div>
  );
}
