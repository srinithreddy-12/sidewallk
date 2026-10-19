import { PublicStateScreen } from "@/components/ui/PublicStateScreen";

/**
 * Covers a missing slug, a draft town and a database error with one message
 * on purpose — a signed-out visitor must never be able to tell a private
 * draft apart from a town that doesn't exist.
 */
export default function TownNotFound() {
  return (
    <PublicStateScreen
      icon="⌂"
      title="This street isn't open to visitors."
      body="The town you're looking for isn't published, or the link may be out of date. Check the link, or explore the sample neighborhood instead."
    />
  );
}
