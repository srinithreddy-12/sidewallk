"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitationAction } from "@/app/invite/[token]/actions";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleAccept() {
    setState("pending");
    setMessage(null);
    const result = await acceptInvitationAction(token);
    if (!result.ok) {
      setState("error");
      setMessage(result.reason);
      return;
    }
    router.push(`/workspace/towns/${result.data.townId}`);
  }

  return (
    <div>
      <button className="button button--primary" type="button" onClick={handleAccept} disabled={state === "pending"}>
        {state === "pending" ? "Joining…" : "Accept invitation"}
      </button>
      {message ? (
        <p role="alert" style={{ color: "#9a3b2d", fontSize: 12, marginTop: 12 }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
