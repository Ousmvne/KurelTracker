import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { safeQuery, today, ATTENDANCE_CYCLE } from "../lib/utils";

export function useSessions(groupId, members, setSessions, setAttendance, showToast) {
  const createSession = useCallback(async (selectedSongIds, date) => {
    const { data: session, error } = await safeQuery(() =>
      supabase.from("sessions")
        .insert({ date: date || today(), group_id: groupId })
        .select().single()
    );

    if (error || !session) {
      showToast("Erreur lors de la création de la séance");
      return null;
    }

    // One attendance row per member × per selected xasiida
    const rows = [];
    for (const m of members) {
      for (const songId of selectedSongIds) {
        rows.push({ session_id: session.id, member_id: m.id, song_id: songId, status: "absent" });
      }
    }

    const { data: newAtt } = await safeQuery(() =>
      supabase.from("attendance").insert(rows).select()
    );

    setSessions((prev) => [...prev, session]);
    setAttendance((prev) => [...prev, ...(newAtt || [])]);
    showToast("Séance créée ✓");
    return session.id;
  }, [groupId, members, setSessions, setAttendance, showToast]);

  const deleteSession = useCallback(async (sessionId) => {
    const { error } = await safeQuery(() =>
      supabase.from("sessions").delete().eq("id", sessionId)
    );

    if (error) {
      showToast("Erreur lors de la suppression");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setAttendance((prev) => prev.filter((a) => a.session_id !== sessionId));
    showToast("Séance supprimée");
  }, [setSessions, setAttendance, showToast]);

  const toggleAttendance = useCallback(async (sessionId, memberId, songId, currentAttendance) => {
    const att = currentAttendance.find((a) =>
      a.session_id === sessionId && a.member_id === memberId && a.song_id === songId
    );

    if (!att) {
      const { data: newAtt, error } = await safeQuery(() =>
        supabase.from("attendance")
          .insert({ session_id: sessionId, member_id: memberId, song_id: songId, status: "present" })
          .select().single()
      );
      if (!error && newAtt) setAttendance((prev) => [...prev, newAtt]);
      return;
    }

    const next = ATTENDANCE_CYCLE[(ATTENDANCE_CYCLE.indexOf(att.status) + 1) % ATTENDANCE_CYCLE.length];
    const { error } = await safeQuery(() =>
      supabase.from("attendance").update({ status: next }).eq("id", att.id)
    );
    if (error) return;
    setAttendance((prev) => prev.map((a) => (a.id === att.id ? { ...a, status: next } : a)));
  }, [setAttendance]);

  return { createSession, deleteSession, toggleAttendance };
}
