"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RepositoryResult } from "@/lib/repository/workspace";
import { PublishControl } from "./PublishControl";
import { TownSettingsForm } from "./TownSettingsForm";

type VersionedMutationResult = RepositoryResult<{ version: number }>;
export type RunTownMutation = (
  mutation: (expectedVersion: number) => Promise<VersionedMutationResult>,
) => Promise<VersionedMutationResult | null>;

export function TownManagementControls({
  townId,
  townName,
  townSlug,
  initialPublished,
  initialVersion,
}: {
  townId: string;
  townName: string;
  townSlug: string;
  initialPublished: boolean;
  initialVersion: number;
}) {
  const versionRef = useRef(initialVersion);
  const mutationPendingRef = useRef(false);
  const [mutationPending, setMutationPending] = useState(false);

  useEffect(() => {
    versionRef.current = initialVersion;
  }, [initialVersion]);

  const runMutation = useCallback<RunTownMutation>(async (mutation) => {
    if (mutationPendingRef.current) return null;

    mutationPendingRef.current = true;
    setMutationPending(true);
    try {
      const result = await mutation(versionRef.current);
      if (result.ok) versionRef.current = result.data.version;
      return result;
    } finally {
      mutationPendingRef.current = false;
      setMutationPending(false);
    }
  }, []);

  return (
    <>
      <TownSettingsForm
        townId={townId}
        initialName={townName}
        mutationPending={mutationPending}
        runMutation={runMutation}
      />
      <div style={{ marginTop: 20 }}>
        <PublishControl
          townId={townId}
          townSlug={townSlug}
          initialPublished={initialPublished}
          mutationPending={mutationPending}
          runMutation={runMutation}
        />
      </div>
    </>
  );
}
