import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { safeQuery } from "../lib/utils";

function extractStoragePath(url) {
  const marker = "/object/public/song-audio/";
  const idx = url?.indexOf(marker);
  if (idx === -1 || idx == null) return null;
  return url.slice(idx + marker.length);
}

export function useSongs(groupId, setSongs, songs, sessions, setSessions, setAttendance, showToast) {
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
    const song = songs.find((s) => s.id === id);
    const storagePath = extractStoragePath(song?.audio_url);
    if (storagePath) {
      await supabase.storage.from("song-audio").remove([storagePath]);
    }

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
  }, [songs, sessions, setSongs, setSessions, setAttendance, showToast]);

  const updateSongAudio = useCallback(async (songId, audioUrl) => {
    const { data, error } = await safeQuery(() =>
      supabase.from("songs").update({ audio_url: audioUrl }).eq("id", songId).select().single()
    );

    if (error) {
      showToast("Erreur lors de la mise à jour audio");
      return;
    }
    if (data) {
      setSongs((prev) => prev.map((s) => s.id === songId ? data : s));
      showToast("Audio ajouté ✓");
    }
  }, [setSongs, showToast]);

  const removeSongAudio = useCallback(async (songId, currentUrl) => {
    const storagePath = extractStoragePath(currentUrl);
    if (storagePath) {
      await supabase.storage.from("song-audio").remove([storagePath]);
    }

    const { data, error } = await safeQuery(() =>
      supabase.from("songs").update({ audio_url: null }).eq("id", songId).select().single()
    );

    if (error) {
      showToast("Erreur lors de la suppression audio");
      return;
    }
    if (data) {
      setSongs((prev) => prev.map((s) => s.id === songId ? data : s));
      showToast("Audio supprimé");
    }
  }, [setSongs, showToast]);

  return { addSong, removeSong, updateSongAudio, removeSongAudio };
}
