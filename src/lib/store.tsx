"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_TOWN } from "./demo-data";
import { applyOverride, loadOverrides, mergeOverride, saveOverrides, type StorageStatus } from "./storage";
import type { Member, MemberOverride, OverrideMap, Town } from "./types";

interface TownContextValue {
  town: Town;
  demoTown: Town;
  overrides: OverrideMap;
  /** False until the post-mount storage read completes, so render never depends on localStorage during SSR. */
  hydrated: boolean;
  saveStatus: StorageStatus | null;
  updateMember: (memberId: string, patch: MemberOverride) => void;
  resetMember: (memberId: string) => void;
}

const TownContext = createContext<TownContextValue | null>(null);

export function TownProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<StorageStatus | null>(null);

  useEffect(() => {
    setOverrides(loadOverrides());
    setHydrated(true);
  }, []);

  const updateMember = useCallback(
    (memberId: string, patch: MemberOverride) => {
      setOverrides((current) => {
        const next = { ...current, [memberId]: mergeOverride(current[memberId], patch) };
        setSaveStatus(saveOverrides(next));
        return next;
      });
    },
    [],
  );

  const resetMember = useCallback((memberId: string) => {
    setOverrides((current) => {
      if (!(memberId in current)) return current;
      const next = { ...current };
      delete next[memberId];
      setSaveStatus(saveOverrides(next));
      return next;
    });
  }, []);

  const town = useMemo<Town>(
    () => ({
      ...DEMO_TOWN,
      members: DEMO_TOWN.members.map((member) => applyOverride(member, overrides[member.id])),
    }),
    [overrides],
  );

  const value = useMemo<TownContextValue>(
    () => ({ town, demoTown: DEMO_TOWN, overrides, hydrated, saveStatus, updateMember, resetMember }),
    [town, overrides, hydrated, saveStatus, updateMember, resetMember],
  );

  return <TownContext.Provider value={value}>{children}</TownContext.Provider>;
}

export function useTown(): TownContextValue {
  const ctx = useContext(TownContext);
  if (!ctx) throw new Error("useTown must be used within a TownProvider");
  return ctx;
}

export function useMember(memberId: string): Member | undefined {
  const { town } = useTown();
  return town.members.find((member) => member.id === memberId);
}
