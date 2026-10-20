"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMember } from "@/lib/store";
import { isSafeUrl } from "@/lib/links";
import { RoomScene } from "@/components/interior/RoomScene";
import { LocalEditorPanel } from "@/components/editor/LocalEditorPanel";
import { Brand } from "@/components/ui/Brand";
import { Dialog } from "@/components/ui/Dialog";
import styles from "./page.module.css";
export default function BuildingPage() {
    const { memberId } = useParams<{
        memberId: string;
    }>();
    const member = useMember(memberId);
    const [isEditing, setIsEditing] = useState(false);
    if (!member)
        return <main id="main-content" className={styles.page}><p>We couldn&apos;t find that place. <Link href="/" className="button">Back to the neighborhood</Link></p></main>;
    return <main id="main-content" className={styles.page}><header className={styles.nav}><Brand /><Link href="/" className={styles.breadcrumb}>The Creative Quarter <span>/</span> {member.name}</Link><button className="button" aria-expanded={isEditing} onClick={() => setIsEditing(v => !v)}>{isEditing ? "Close" : "Edit room"}</button></header>
 <div className={styles.layout}><aside className={styles.info}><Link href="/" className={styles.back}>← Back to the neighborhood</Link><p className={styles.eyebrow}>{member.category} / Sample member</p><h1>{member.name || "Untitled place"}</h1><p className={styles.tagline}>{member.tagline}</p><div className={styles.rule}/><p className={styles.description}>{member.description}</p><p className={styles.sample}>An example space, with original sample work.</p>{isSafeUrl(member.action.url) ? <a className={`button button--primary ${styles.action}`} href={member.action.url} target="_blank" rel="noopener noreferrer">{member.action.label || "Visit website"}<span>↗</span></a> : null}<div className={styles.visitNote}><span>⌘</span><p>Take a closer look.<br /><strong>Select a framed work or display to explore it.</strong></p></div></aside>
 <section className={styles.room} aria-label="Explore the interior"><div className={styles.roomHeading}><span>{member.room.template} interior</span><span>Original sample space · 0{member.building.position + 1}</span></div><RoomScene room={member.room} memberId={member.id}/></section></div>
 {isEditing ? <Dialog titleId="room-editor-title" onClose={() => setIsEditing(false)}><h2 id="room-editor-title" className="visually-hidden">Local room editor</h2><LocalEditorPanel member={member} onClose={() => setIsEditing(false)}/></Dialog> : null}</main>;
}
