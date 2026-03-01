import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { safeQuery } from "../lib/utils";

export function useGroup(group, setGroup, showToast) {
  const updateGroup = useCallback(async (updates) => {
    const { data, error } = await safeQuery(() =>
      supabase.from("groups").update(updates).eq("id", group.id).select().single()
    );

    if (error) {
      showToast("Erreur lors de la sauvegarde");
      return;
    }
    if (data) {
      setGroup(data);
      showToast("Paramètres sauvegardés ✓");
    }
  }, [group?.id, setGroup, showToast]);

  return { updateGroup };
}
