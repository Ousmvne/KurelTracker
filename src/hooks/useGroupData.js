import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useGroupData(groupId) {
  const [members, setMembers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [mRes, sRes, ssRes] = await Promise.all([
        supabase.from("members").select("*").eq("group_id", groupId).order("created_at"),
        supabase.from("songs").select("*").eq("group_id", groupId).order("created_at"),
        supabase.from("sessions").select("*").eq("group_id", groupId).order("date"),
      ]);

      if (mRes.error || sRes.error || ssRes.error) {
        throw new Error(mRes.error?.message || sRes.error?.message || ssRes.error?.message);
      }

      const sessionIds = (ssRes.data || []).map((s) => s.id);
      let attData = [];
      if (sessionIds.length > 0) {
        const { data, error: attErr } = await supabase.from("attendance").select("*").in("session_id", sessionIds);
        if (attErr) throw new Error(attErr.message);
        attData = data || [];
      }

      setMembers(mRes.data || []);
      setSongs(sRes.data || []);
      setSessions(ssRes.data || []);
      setAttendance(attData);
    } catch (err) {
      console.error("[useGroupData]", err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    members, songs, sessions, attendance,
    setMembers, setSongs, setSessions, setAttendance,
    loading, error, refetch: fetchData,
  };
}
