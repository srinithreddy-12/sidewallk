import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedTownBySlug } from "@/lib/repository/public";
import { PublicTownView } from "@/components/town/PublicTownView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ townSlug: string }>;
}): Promise<Metadata> {
  const { townSlug } = await params;
  const town = await getPublishedTownBySlug(townSlug);
  if (!town) return { title: "Town not found — Sidewallk" };
  return {
    title: `${town.name} — Sidewallk`,
    description: `Explore ${town.name}, an explorable Sidewallk neighborhood.`,
  };
}

export default async function PublicTownPage({ params }: { params: Promise<{ townSlug: string }> }) {
  const { townSlug } = await params;
  const town = await getPublishedTownBySlug(townSlug);
  if (!town) notFound();

  return <PublicTownView town={town} />;
}
