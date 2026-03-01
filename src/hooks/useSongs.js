import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { safeQuery } from "../lib/utils";

export function useSongs(groupId, setSongs, sessions, setSessions, setAttendance, showToast) {
  const addSong = useCallback(async (name, targetReps) => {
    if (!name.trim()) return;

    const { data, error } = await safeQuery(() =>
      supabase.from("songs")
        .insert({ name: name.trim(), target_reps: parseInt(targetReps) || 10, group_id: groupId })
        .select().single()
    );

    if (error) {
      showToast("Erreur lors de l'ajout du morceau");
      return;
    }
    if (data) {
      setSongs((prev) => [...prev, data]);
      showToast("Morceau ajouté ✓");
    }
  }, [groupId, setSongs, showToast]);

  const removeSong = useCallback(async (id) => {
    const { error } = await safeQuery(() =>
      supabase.from("songs").delete().eq("id", id)
    );

    if (error) {
      showToast("Erreur lors de la suppression");
      return;
    }

    const removedSessionIds = sessions.filter((s) => s.song_id === id).map((s) => s.id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.song_id !== id));
    setAttendance((prev) => prev.filter((a) => !removedSessionIds.includes(a.session_id)));
    showToast("Morceau supprimé");
  }, [sessions, setSongs, setSessions, setAttendance, showToast]);

  return { addSong, removeSong };
}
