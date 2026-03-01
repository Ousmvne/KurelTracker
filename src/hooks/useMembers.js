import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { safeQuery } from "../lib/utils";

export function useMembers(groupId, setMembers, setAttendance, showToast) {
  const addMember = useCallback(async (name, email) => {
    if (!name.trim()) return;

    const { data, error } = await safeQuery(() =>
      supabase.from("members")
        .insert({ name: name.trim(), email: email?.trim() || null, group_id: groupId })
        .select().single()
    );

    if (error) {
      showToast("Erreur lors de l'ajout du membre");
      return;
    }
    if (data) {
      setMembers((prev) => [...prev, data]);
      showToast("Membre ajouté ✓");
    }
  }, [groupId, setMembers, showToast]);

  const removeMember = useCallback(async (id) => {
    const { error } = await safeQuery(() =>
      supabase.from("members").delete().eq("id", id)
    );

    if (error) {
      showToast("Erreur lors de la suppression");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setAttendance((prev) => prev.filter((a) => a.member_id !== id));
    showToast("Membre supprimé");
  }, [setMembers, setAttendance, showToast]);

  return { addMember, removeMember };
}
