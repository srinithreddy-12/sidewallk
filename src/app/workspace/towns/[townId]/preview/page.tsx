import { redirect } from "next/navigation";
import { getAuthenticatedViewer } from "@/lib/viewer";
import { getWorkspaceTown } from "@/lib/repository/workspace";
import { PublicTownView } from "@/components/town/PublicTownView";
import { PublicStateScreen } from "@/components/ui/PublicStateScreen";

export default async function WorkspaceTownPreviewPage({ params }: { params: Promise<{ townId: string }> }) {
  const { townId } = await params;
  const viewer = await getAuthenticatedViewer();
  if (!viewer) redirect(`/sign-in?next=/workspace/towns/${townId}/preview`);

  const result = await getWorkspaceTown(townId, viewer);
  if (!result.ok) {
    return (
      <PublicStateScreen
        icon="⌂"
        title="Can't preview this town"
        body="You don't have access to this town, or it couldn't be loaded."
      />
    );
  }

  return (
    <PublicTownView
      town={result.data.town}
      homeHref={`/workspace/towns/${townId}`}
      getMemberHref={(member) => `/workspace/towns/${townId}/members/${member.id}`}
      draftBanner
    />
  );
}
