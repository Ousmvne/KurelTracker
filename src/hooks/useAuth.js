import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { today } from "../lib/utils";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [group, setGroup] = useState(null);
  const [myMember, setMyMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const clearError = useCallback(() => setError(""), []);
  const clearMessage = useCallback(() => setMessage(""), []);

  const loadUserData = useCallback(async (u) => {
    setLoading(true);
    setError("");

    try {
      // Check admin
      const { data: adminGroup, error: adminErr } = await supabase
        .from("groups").select("*").eq("admin_id", u.id).maybeSingle();
      if (adminErr) throw new Error(adminErr.message);
      if (adminGroup) {
        setRole("admin");
        setGroup(adminGroup);
        setLoading(false);
        return;
      }

      // Check member (already linked)
      const { data: memberRecord, error: memberErr } = await supabase
        .from("members").select("*, groups(*)").eq("user_id", u.id).maybeSingle();
      if (memberErr) throw new Error(memberErr.message);
      if (memberRecord) {
        setRole("member");
        setMyMember(memberRecord);
        setGroup(memberRecord.groups);
        setLoading(false);
        return;
      }

      // Check if email matches an unlinked member
      const { data: matchingMember, error: matchErr } = await supabase
        .from("members").select("*, groups(*)").eq("email", u.email).is("user_id", null).maybeSingle();
      if (matchErr) throw new Error(matchErr.message);
      if (matchingMember) {
        await supabase.from("members").update({ user_id: u.id }).eq("id", matchingMember.id);
        setRole("member");
        setMyMember({ ...matchingMember, user_id: u.id });
        setGroup(matchingMember.groups);
        setLoading(false);
        return;
      }

      // New user → becomes admin of a new group
      const { data: newGroup, error: groupErr } = await supabase
        .from("groups")
        .insert({ name: "Mon Kurel", start_date: today(), admin_id: u.id })
        .select().single();
      if (groupErr) throw new Error(groupErr.message);
      setRole("admin");
      setGroup(newGroup);
    } catch (err) {
      console.error("[useAuth] loadUserData failed:", err.message);
      setError("Erreur de connexion au serveur. Vérifiez que votre projet Supabase est actif.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user);
      else {
        setRole(null);
        setGroup(null);
        setMyMember(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const login = useCallback(async (email, password) => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }, []);

  const signup = useCallback(async (email, password, name) => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Compte créé ! Vérifiez votre email pour confirmer.");
    }
    setLoading(false);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMessage("Email de réinitialisation envoyé !");
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setGroup(null);
    setMyMember(null);
  }, []);

  return {
    user, role, group, setGroup, myMember, loading,
    error, message, clearError, clearMessage,
    login, signup, forgotPassword, logout,
  };
}
