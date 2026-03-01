import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const today = () => new Date().toISOString().slice(0, 10);

// ═══════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
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
      setMode("login");
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMessage("Email de réinitialisation envoyé !");
    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <div style={{ position: "absolute", top: -120, left: -120, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      <div style={{ position: "absolute", bottom: "30%", left: "5%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={styles.authCard}>
        <div style={styles.authLogo}>🎵</div>
        <h1 style={styles.authTitle}>Kurel Tracker</h1>
        <p style={styles.authSub}>
          {mode === "login" && "Connectez-vous pour accéder à votre espace"}
          {mode === "signup" && "Créez votre compte"}
          {mode === "forgot" && "Réinitialisez votre mot de passe"}
        </p>

        {error && <div style={styles.authError}>{error}</div>}
        {message && <div style={styles.authSuccess}>{message}</div>}

        <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}>
          {mode === "signup" && (
            <input
              style={styles.authInput}
              type="text"
              placeholder="Votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            style={styles.authInput}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode !== "forgot" && (
            <input
              style={styles.authInput}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          )}
          <button style={styles.authBtn} type="submit" disabled={loading}>
            {loading
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : mode === "signup"
              ? "Créer un compte"
              : "Envoyer le lien"}
          </button>
        </form>

        <div style={styles.authLinks}>
          {mode === "login" && (
            <>
              <button style={styles.authLink} onClick={() => { setMode("signup"); setError(""); }}>
                Pas de compte ? Inscrivez-vous
              </button>
              <button style={styles.authLink} onClick={() => { setMode("forgot"); setError(""); }}>
                Mot de passe oublié ?
              </button>
            </>
          )}
          {mode !== "login" && (
            <button style={styles.authLink} onClick={() => { setMode("login"); setError(""); }}>
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MEMBER DASHBOARD (read-only)
// ═══════════════════════════════════════════
function MemberDashboard({ member, group, sessions, songs, attendance, onLogout }) {
  const myAttendance = attendance.filter((a) => a.member_id === member.id);
  const totalSessions = sessions.length;
  const totalPresent = myAttendance.filter((a) => a.status === "present").length;
  const totalVocal = myAttendance.filter((a) => a.status === "vocal").length;
  const totalValid = totalPresent + totalVocal;
  const pct = totalSessions > 0 ? Math.round((totalValid / totalSessions) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroIcon}>👤</div>
        <h1 style={styles.heroTitle}>{member.name}</h1>
        <p style={styles.heroSub}>{group.name}</p>
      </div>

      <div style={styles.memberStatsGrid}>
        <div style={styles.memberStatBox}>
          <div style={styles.memberStatNum}>{totalValid}/{totalSessions}</div>
          <div style={styles.memberStatLabel}>Présences</div>
        </div>
        <div style={styles.memberStatBox}>
          <div style={styles.memberStatNum}>{pct}%</div>
          <div style={styles.memberStatLabel}>Assiduité</div>
        </div>
        <div style={styles.memberStatBox}>
          <div style={styles.memberStatNum}>{totalPresent}</div>
          <div style={styles.memberStatLabel}>✅ Présent</div>
        </div>
        <div style={styles.memberStatBox}>
          <div style={styles.memberStatNum}>{totalVocal}</div>
          <div style={styles.memberStatLabel}>🎤 Vocal</div>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626",
          }}
        />
      </div>
      <p style={{ ...styles.progressText, textAlign: "center", marginBottom: 24, fontSize: 14 }}>
        {pct >= 80 ? "Excellent ! Continue comme ça 💪" : pct >= 50 ? "Pas mal, mais tu peux mieux faire !" : "Il faut venir plus souvent aux répétitions !"}
      </p>

      <h3 style={styles.sectionTitle}>Historique des séances</h3>
      <div style={styles.list}>
        {sessions.slice().reverse().map((session) => {
          const song = songs.find((s) => s.id === session.song_id);
          const att = myAttendance.find((a) => a.session_id === session.id);
          const status = att?.status || "absent";
          const cfgMap = {
            present: { icon: "✅", label: "Présent", color: "#16a34a", bg: "#dcfce7" },
            vocal: { icon: "🎤", label: "Vocal", color: "#2563eb", bg: "#dbeafe" },
            absent: { icon: "❌", label: "Absent", color: "#dc2626", bg: "#fee2e2" },
          };
          const cfg = cfgMap[status];
          return (
            <div key={session.id} style={{ ...styles.listItem, borderLeft: `4px solid ${cfg.color}` }}>
              <div>
                <div style={styles.listName}>{song?.name || "—"}</div>
                <div style={styles.progressText}>{fmtDate(session.date)}</div>
              </div>
              <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
          );
        })}
        {sessions.length === 0 && <p style={styles.emptyText}>Aucune séance enregistrée.</p>}
      </div>

      <button style={{ ...styles.logoutBtn, marginTop: 32 }} onClick={onLogout}>
        Se déconnecter
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [myMember, setMyMember] = useState(null);

  const [view, setView] = useState("home");
  const [activeSession, setActiveSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ——— AUTH ———
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user);
      else { setRole(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (u) => {
    setLoading(true);

    // Check admin
    const { data: adminGroup } = await supabase
      .from("groups").select("*").eq("admin_id", u.id).maybeSingle();
    if (adminGroup) {
      setRole("admin");
      setGroup(adminGroup);
      await loadGroupData(adminGroup.id);
      setLoading(false);
      return;
    }

    // Check member (already linked)
    const { data: memberRecord } = await supabase
      .from("members").select("*, groups(*)").eq("user_id", u.id).maybeSingle();
    if (memberRecord) {
      setRole("member");
      setMyMember(memberRecord);
      setGroup(memberRecord.groups);
      await loadGroupData(memberRecord.group_id);
      setLoading(false);
      return;
    }

    // Check if email matches an unlinked member
    const { data: matchingMember } = await supabase
      .from("members").select("*, groups(*)").eq("email", u.email).is("user_id", null).maybeSingle();
    if (matchingMember) {
      await supabase.from("members").update({ user_id: u.id }).eq("id", matchingMember.id);
      setRole("member");
      setMyMember({ ...matchingMember, user_id: u.id });
      setGroup(matchingMember.groups);
      await loadGroupData(matchingMember.group_id);
      setLoading(false);
      return;
    }

    // New user → becomes admin of a new group
    const { data: newGroup } = await supabase
      .from("groups")
      .insert({ name: "Mon Kurel", start_date: today(), admin_id: u.id })
      .select().single();
    setRole("admin");
    setGroup(newGroup);
    setMembers([]);
    setSongs([]);
    setSessions([]);
    setAttendance([]);
    setLoading(false);
  };

  const loadGroupData = async (groupId) => {
    const [mRes, sRes, ssRes] = await Promise.all([
      supabase.from("members").select("*").eq("group_id", groupId).order("created_at"),
      supabase.from("songs").select("*").eq("group_id", groupId).order("created_at"),
      supabase.from("sessions").select("*").eq("group_id", groupId).order("date"),
    ]);
    const sessionIds = (ssRes.data || []).map((s) => s.id);
    let attData = [];
    if (sessionIds.length > 0) {
      const { data } = await supabase.from("attendance").select("*").in("session_id", sessionIds);
      attData = data || [];
    }
    setMembers(mRes.data || []);
    setSongs(sRes.data || []);
    setSessions(ssRes.data || []);
    setAttendance(attData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setRole(null); setGroup(null);
    setMembers([]); setSongs([]); setSessions([]); setAttendance([]);
    setView("home");
  };

  // ——— ADMIN ACTIONS ———
  const addMember = async (name, email) => {
    if (!name.trim()) return;
    const { data } = await supabase
      .from("members")
      .insert({ name: name.trim(), email: email?.trim() || null, group_id: group.id })
      .select().single();
    if (data) { setMembers([...members, data]); showToast("Membre ajouté ✓"); }
  };

  const removeMember = async (id) => {
    await supabase.from("members").delete().eq("id", id);
    setMembers(members.filter((m) => m.id !== id));
    setAttendance(attendance.filter((a) => a.member_id !== id));
    showToast("Membre supprimé");
  };

  const addSong = async (name, targetReps) => {
    if (!name.trim()) return;
    const { data } = await supabase
      .from("songs")
      .insert({ name: name.trim(), target_reps: parseInt(targetReps) || 10, group_id: group.id })
      .select().single();
    if (data) { setSongs([...songs, data]); showToast("Morceau ajouté ✓"); }
  };

  const removeSong = async (id) => {
    await supabase.from("songs").delete().eq("id", id);
    const removedIds = sessions.filter((s) => s.song_id === id).map((s) => s.id);
    setSongs(songs.filter((s) => s.id !== id));
    setSessions(sessions.filter((s) => s.song_id !== id));
    setAttendance(attendance.filter((a) => !removedIds.includes(a.session_id)));
    showToast("Morceau supprimé");
  };

  const createSession = async (songId) => {
    const { data: session } = await supabase
      .from("sessions")
      .insert({ song_id: songId, date: today(), group_id: group.id })
      .select().single();
    if (session) {
      const rows = members.map((m) => ({ session_id: session.id, member_id: m.id, status: "absent" }));
      const { data: newAtt } = await supabase.from("attendance").insert(rows).select();
      setSessions([...sessions, session]);
      setAttendance([...attendance, ...(newAtt || [])]);
      setActiveSession(session.id);
      setView("session");
      showToast("Séance créée ✓");
    }
  };

  const toggleAttendance = async (sessionId, memberId) => {
    const states = ["absent", "present", "vocal"];
    const att = attendance.find((a) => a.session_id === sessionId && a.member_id === memberId);
    if (!att) return;
    const next = states[(states.indexOf(att.status) + 1) % states.length];
    await supabase.from("attendance").update({ status: next }).eq("id", att.id);
    setAttendance(attendance.map((a) => (a.id === att.id ? { ...a, status: next } : a)));
  };

  const deleteSession = async (sessionId) => {
    await supabase.from("sessions").delete().eq("id", sessionId);
    setSessions(sessions.filter((s) => s.id !== sessionId));
    setAttendance(attendance.filter((a) => a.session_id !== sessionId));
    showToast("Séance supprimée");
    if (activeSession === sessionId) { setView("home"); setActiveSession(null); }
  };

  const updateGroup = async (updates) => {
    const { data } = await supabase.from("groups").update(updates).eq("id", group.id).select().single();
    if (data) setGroup(data);
  };

  // ——— HELPERS ———
  const getMemberStats = (memberId) => {
    const ma = attendance.filter((a) => a.member_id === memberId);
    const p = ma.filter((a) => a.status === "present").length;
    const v = ma.filter((a) => a.status === "vocal").length;
    return { totalPresent: p, totalVocal: v, totalSessions: sessions.length, totalValid: p + v };
  };

  const getSongStats = (songId) => {
    const ss = sessions.filter((s) => s.song_id === songId);
    const song = songs.find((s) => s.id === songId);
    return { completed: ss.length, target: song?.target_reps || 10 };
  };

  const generateWhatsAppSummary = () => {
    let text = `*SUIVI RÉPÉTITIONS ${group.name}*\n\n`;
    text += `• Début officiel : ${fmtDate(group.start_date)}\n`;
    text += `• Répétitions globales : ${sessions.length}\n\n`;
    songs.forEach((song) => {
      const s = getSongStats(song.id);
      text += `*${song.name}* (${s.completed}/${s.target})\n`;
    });
    text += `\n`;
    members.forEach((member, i) => {
      const s = getMemberStats(member.id);
      text += `${i + 1}. S. ${member.name} `;
      sessions.forEach((session) => {
        const a = attendance.find((a) => a.session_id === session.id && a.member_id === member.id);
        text += a?.status === "present" ? "✅" : a?.status === "vocal" ? "🎤" : "❌";
      });
      text += ` (${s.totalValid}/${s.totalSessions})\n`;
    });
    text += `\n_Généré par Kurel Tracker_`;
    navigator.clipboard?.writeText(text);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    showToast("Résumé copié ✓");
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: "#555", marginTop: 16, fontFamily }}>Chargement...</p>
      </div>
    );
  }

  if (!user) return (<><style>{globalCSS}</style><style>{`
    #root { display:flex !important; padding:0 !important; }
    #root > div { border-radius:0 !important; min-height:100vh !important; max-width:100% !important; width:100% !important; box-shadow:none !important; }
  `}</style><div style={styles.app}><AuthScreen /></div></>);

  if (role === "member" && myMember && group) {
    return (
      <><style>{globalCSS}</style>
        <div style={styles.app}>
          {toast && <div style={styles.toast}>{toast}</div>}
          <MemberDashboard member={myMember} group={group} sessions={sessions}
            songs={songs} attendance={attendance} onLogout={handleLogout} />
        </div>
      </>
    );
  }

  // ——— ADMIN VIEWS ———
  const renderHome = () => (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroIcon}>🎵</div>
        <h1 style={styles.heroTitle}>{group?.name}</h1>
        <p style={styles.heroSub}>
          Depuis le {fmtDate(group?.start_date)} • {members.length} membres • {sessions.length} séances
        </p>
      </div>
      <div style={styles.grid}>
        <button style={styles.gridBtn} onClick={() => setView("members")}>
          <span style={styles.gridIcon}>👥</span><span style={styles.gridLabel}>Membres</span>
          <span style={styles.gridCount}>{members.length}</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("songs")}>
          <span style={styles.gridIcon}>🎶</span><span style={styles.gridLabel}>Morceaux</span>
          <span style={styles.gridCount}>{songs.length}</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("newSession")}>
          <span style={styles.gridIcon}>📋</span><span style={styles.gridLabel}>Nouvelle Séance</span>
          <span style={styles.gridCount}>+</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("stats")}>
          <span style={styles.gridIcon}>📊</span><span style={styles.gridLabel}>Statistiques</span>
          <span style={styles.gridCount}>→</span>
        </button>
      </div>

      {sessions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Séances récentes</h3>
          {sessions.slice(-5).reverse().map((session) => {
            const song = songs.find((s) => s.id === session.song_id);
            const sa = attendance.filter((a) => a.session_id === session.id);
            return (
              <button key={session.id} style={styles.sessionCard}
                onClick={() => { setActiveSession(session.id); setView("session"); }}>
                <div>
                  <div style={styles.sessionSong}>{song?.name || "—"}</div>
                  <div style={styles.sessionDate}>{fmtDate(session.date)}</div>
                </div>
                <div style={styles.sessionBadges}>
                  <span style={styles.badgeGreen}>✅ {sa.filter((a) => a.status === "present").length}</span>
                  <span style={styles.badgeBlue}>🎤 {sa.filter((a) => a.status === "vocal").length}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button style={styles.whatsappBtn} onClick={generateWhatsAppSummary}>
        <span style={{ fontSize: 20 }}>📱</span> Partager sur WhatsApp
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button style={styles.settingsLink} onClick={() => setView("settings")}>⚙️ Paramètres</button>
        <button style={styles.settingsLink} onClick={handleLogout}>🚪 Déconnexion</button>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
      <h2 style={styles.pageTitle}>👥 Membres ({members.length})</h2>
      <MemberForm onAdd={addMember} />
      <div style={styles.list}>
        {members.map((m, i) => (
          <div key={m.id} style={styles.listItem}>
            <div style={styles.listItemLeft}>
              <span style={styles.listNum}>{i + 1}</span>
              <div>
                <span style={styles.listName}>{m.name}</span>
                {m.email && <div style={{ fontSize: 11, color: "#6b7280" }}>{m.email}</div>}
                {m.user_id && <div style={{ fontSize: 10, color: "#16a34a" }}>✓ Compte lié</div>}
              </div>
            </div>
            <button style={styles.deleteBtn}
              onClick={() => setConfirmAction({ msg: `Supprimer ${m.name} ?`, action: () => removeMember(m.id) })}>
              🗑
            </button>
          </div>
        ))}
        {members.length === 0 && <p style={styles.emptyText}>Aucun membre.</p>}
      </div>
    </div>
  );

  const renderSongs = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
      <h2 style={styles.pageTitle}>🎶 Morceaux ({songs.length})</h2>
      <SongForm onAdd={addSong} />
      <div style={styles.list}>
        {songs.map((song) => {
          const s = getSongStats(song.id);
          const pct = s.target > 0 ? Math.round((s.completed / s.target) * 100) : 0;
          return (
            <div key={song.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={styles.listName}>{song.name}</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? "#16a34a" : "#f59e0b" }} />
                </div>
                <div style={styles.progressText}>{s.completed}/{s.target} ({pct}%)</div>
              </div>
              <button style={styles.deleteBtn}
                onClick={() => setConfirmAction({ msg: `Supprimer "${song.name}" ?`, action: () => removeSong(song.id) })}>
                🗑
              </button>
            </div>
          );
        })}
        {songs.length === 0 && <p style={styles.emptyText}>Aucun morceau.</p>}
      </div>
    </div>
  );

  const renderNewSession = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
      <h2 style={styles.pageTitle}>📋 Nouvelle Séance</h2>
      {songs.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>Ajoutez d'abord un morceau.</p>
          <button style={styles.primaryBtn} onClick={() => setView("songs")}>Ajouter un morceau</button>
        </div>
      ) : members.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>Ajoutez d'abord des membres.</p>
          <button style={styles.primaryBtn} onClick={() => setView("members")}>Ajouter des membres</button>
        </div>
      ) : (
        <div style={styles.list}>
          <p style={styles.hint}>Choisissez le morceau :</p>
          {songs.map((song) => {
            const s = getSongStats(song.id);
            return (
              <button key={song.id} style={styles.songPickBtn} onClick={() => createSession(song.id)}>
                <span style={{ fontWeight: 600 }}>{song.name}</span>
                <span style={styles.songPickStat}>{s.completed}/{s.target}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSession = () => {
    const session = sessions.find((s) => s.id === activeSession);
    if (!session) { setView("home"); return null; }
    const song = songs.find((s) => s.id === session.song_id);
    const cfgMap = {
      present: { label: "Présent", color: "#16a34a", bg: "#dcfce7", icon: "✅" },
      vocal: { label: "Vocal", color: "#2563eb", bg: "#dbeafe", icon: "🎤" },
      absent: { label: "Absent", color: "#dc2626", bg: "#fee2e2", icon: "❌" },
    };
    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
        <h2 style={styles.pageTitle}>{song?.name || "Séance"} — {fmtDate(session.date)}</h2>
        <p style={styles.hint}>Tapez pour changer : Absent → Présent → Vocal</p>
        <div style={styles.legendRow}>
          {Object.entries(cfgMap).map(([k, c]) => (
            <span key={k} style={{ ...styles.legendItem, color: c.color }}>{c.icon} {c.label}</span>
          ))}
        </div>
        <div style={styles.list}>
          {members.map((m, i) => {
            const att = attendance.find((a) => a.session_id === session.id && a.member_id === m.id);
            const status = att?.status || "absent";
            const cfg = cfgMap[status];
            return (
              <button key={m.id}
                style={{ ...styles.attendanceBtn, backgroundColor: cfg.bg, borderLeft: `4px solid ${cfg.color}` }}
                onClick={() => toggleAttendance(session.id, m.id)}>
                <span style={styles.attendanceNum}>{i + 1}</span>
                <span style={styles.attendanceName}>{m.name}</span>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
              </button>
            );
          })}
        </div>
        <button style={{ ...styles.deleteFullBtn, marginTop: 20 }}
          onClick={() => setConfirmAction({ msg: "Supprimer cette séance ?", action: () => deleteSession(session.id) })}>
          🗑 Supprimer cette séance
        </button>
      </div>
    );
  };

  const renderStats = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
      <h2 style={styles.pageTitle}>📊 Statistiques</h2>
      {members.length === 0 || sessions.length === 0 ? (
        <p style={styles.emptyText}>Pas encore de données.</p>
      ) : (
        <>
          <h3 style={styles.sectionTitle}>Classement membres</h3>
          <div style={styles.list}>
            {members.map((m) => ({ ...m, stats: getMemberStats(m.id) }))
              .sort((a, b) => b.stats.totalValid - a.stats.totalValid)
              .map((m, i) => {
                const pct = m.stats.totalSessions > 0 ? Math.round((m.stats.totalValid / m.stats.totalSessions) * 100) : 0;
                return (
                  <div key={m.id} style={styles.statCard}>
                    <div style={styles.statRank}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.listName}>{m.name}</div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626" }} />
                      </div>
                      <div style={styles.progressText}>✅ {m.stats.totalPresent} • 🎤 {m.stats.totalVocal} • {pct}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
          <h3 style={{ ...styles.sectionTitle, marginTop: 24 }}>Avancement morceaux</h3>
          <div style={styles.list}>
            {songs.map((song) => {
              const s = getSongStats(song.id);
              const pct = s.target > 0 ? Math.round((s.completed / s.target) * 100) : 0;
              return (
                <div key={song.id} style={styles.statCard}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.listName}>{song.name}</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? "#16a34a" : "#f59e0b" }} />
                    </div>
                    <div style={styles.progressText}>{s.completed}/{s.target} ({pct}%)</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderSettings = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>← Retour</button>
      <h2 style={styles.pageTitle}>⚙️ Paramètres</h2>
      <div style={styles.settingsGroup}>
        <label style={styles.label}>Nom du groupe</label>
        <input style={styles.input} value={group?.name || ""} onChange={(e) => updateGroup({ name: e.target.value })} />
      </div>
      <div style={styles.settingsGroup}>
        <label style={styles.label}>Date de début</label>
        <input type="date" style={styles.input} value={group?.start_date || ""} onChange={(e) => updateGroup({ start_date: e.target.value })} />
      </div>
    </div>
  );

  return (
    <><style>{globalCSS}</style>
      <div style={styles.app}>
        {toast && <div style={styles.toast}>{toast}</div>}
        {confirmAction && (
          <div style={styles.overlay}>
            <div style={styles.dialog}>
              <p style={styles.dialogMsg}>{confirmAction.msg}</p>
              <div style={styles.dialogBtns}>
                <button style={styles.dialogCancel} onClick={() => setConfirmAction(null)}>Annuler</button>
                <button style={styles.dialogConfirm} onClick={() => { confirmAction.action(); setConfirmAction(null); }}>Confirmer</button>
              </div>
            </div>
          </div>
        )}
        {view === "home" && renderHome()}
        {view === "members" && renderMembers()}
        {view === "songs" && renderSongs()}
        {view === "newSession" && renderNewSession()}
        {view === "session" && renderSession()}
        {view === "stats" && renderStats()}
        {view === "settings" && renderSettings()}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
// FORM COMPONENTS
// ═══════════════════════════════════════════
function MemberForm({ onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={styles.formRow}>
        <input style={{ ...styles.input, flex: 1 }} placeholder="Nom du membre"
          value={name} onChange={(e) => setName(e.target.value)} />
        <button style={styles.addBtn} onClick={() => { onAdd(name, email); setName(""); setEmail(""); }}>+</button>
      </div>
      <input style={{ ...styles.input, width: "100%", marginTop: 6, boxSizing: "border-box" }}
        placeholder="Email du membre (optionnel — pour lier son compte)"
        type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  );
}

function SongForm({ onAdd }) {
  const [name, setName] = useState("");
  const [reps, setReps] = useState("10");
  return (
    <div style={styles.formRow}>
      <input style={{ ...styles.input, flex: 1 }} placeholder="Nom du morceau"
        value={name} onChange={(e) => setName(e.target.value)} />
      <input style={{ ...styles.input, width: 60, textAlign: "center" }} type="number"
        placeholder="Rép." value={reps} onChange={(e) => setReps(e.target.value)} />
      <button style={styles.addBtn} onClick={() => { onAdd(name, reps); setName(""); setReps("10"); }}>+</button>
    </div>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const fontFamily = "'Segoe UI', 'SF Pro Display', -apple-system, sans-serif";

const globalCSS = `
  html, body, #root { margin:0; padding:0; min-height:100vh; background:#e8f5e9; }
  @media (min-width:640px) {
    #root { display:flex; justify-content:center; padding:24px 0; }
    #root > div { border-radius:20px; min-height:calc(100vh - 48px); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

const styles = {
  app: { fontFamily, width: "100%", maxWidth: 600, minHeight: "100vh", background: "linear-gradient(180deg, #f0fdf4 0%, #fefce8 100%)", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)", overflow: "hidden" },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily },
  loadingSpinner: { width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #16a34a", borderRadius: "50%", animation: "spin 1s linear infinite" },
  page: { padding: "20px 20px 80px" },
  authContainer: { minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f4c2e 0%, #166534 30%, #15803d 60%, #22c55e 100%)", padding: 20, boxSizing: "border-box", position: "relative", overflow: "hidden" },
  authCard: { background: "rgba(255,255,255,0.97)", borderRadius: 28, padding: "48px 32px 40px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", backdropFilter: "blur(10px)", position: "relative", zIndex: 1 },
  authLogo: { fontSize: 60, marginBottom: 4, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" },
  authTitle: { fontSize: 28, fontWeight: 800, color: "#1f2937", margin: "0 0 6px", fontFamily, letterSpacing: -0.5 },
  authSub: { fontSize: 14, color: "#6b7280", margin: "0 0 28px", lineHeight: 1.5 },
  authInput: { display: "block", width: "100%", border: "2px solid #e5e7eb", borderRadius: 14, padding: "14px 18px", fontSize: 15, marginBottom: 14, fontFamily, outline: "none", boxSizing: "border-box", background: "#f9fafb", transition: "border-color 0.2s" },
  authBtn: { width: "100%", background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, marginTop: 8, boxShadow: "0 4px 16px rgba(22,163,74,0.3)", transition: "transform 0.15s, box-shadow 0.15s" },
  authLinks: { marginTop: 24, display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #e5e7eb", paddingTop: 20 },
  authLink: { background: "none", border: "none", color: "#16a34a", fontSize: 14, cursor: "pointer", fontFamily, fontWeight: 600, transition: "color 0.15s" },
  authError: { background: "#fee2e2", color: "#dc2626", borderRadius: 12, padding: "12px 16px", fontSize: 13, marginBottom: 16, fontWeight: 600, textAlign: "left", borderLeft: "4px solid #dc2626" },
  authSuccess: { background: "#dcfce7", color: "#166534", borderRadius: 12, padding: "12px 16px", fontSize: 13, marginBottom: 16, fontWeight: 600, textAlign: "left", borderLeft: "4px solid #16a34a" },
  memberStatsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  memberStatBox: { background: "#fff", borderRadius: 16, padding: "16px 12px", textAlign: "center", border: "1px solid #e5e7eb" },
  memberStatNum: { fontSize: 28, fontWeight: 800, color: "#166534" },
  memberStatLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  logoutBtn: { width: "100%", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily },
  heroCard: { background: "linear-gradient(135deg, #166534 0%, #15803d 60%, #22c55e 100%)", borderRadius: 20, padding: "32px 20px 24px", textAlign: "center", color: "#fff", marginBottom: 20, boxShadow: "0 8px 32px rgba(22,101,52,0.3)" },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 6px", letterSpacing: 0.5 },
  heroSub: { fontSize: 13, opacity: 0.85, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  gridBtn: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontFamily },
  gridIcon: { fontSize: 28 },
  gridLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  gridCount: { fontSize: 12, color: "#16a34a", fontWeight: 700, background: "#dcfce7", borderRadius: 10, padding: "2px 10px" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 10px", fontFamily },
  sessionCard: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", width: "100%", fontFamily, textAlign: "left" },
  sessionSong: { fontWeight: 600, fontSize: 14, color: "#1f2937" },
  sessionDate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  sessionBadges: { display: "flex", gap: 8 },
  badgeGreen: { fontSize: 12, background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 8, fontWeight: 600 },
  badgeBlue: { fontSize: 12, background: "#dbeafe", color: "#1e40af", padding: "3px 8px", borderRadius: 8, fontWeight: 600 },
  whatsappBtn: { width: "100%", background: "#25D366", color: "#fff", border: "none", borderRadius: 14, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily, boxShadow: "0 4px 12px rgba(37,211,102,0.3)" },
  settingsLink: { background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily },
  backBtn: { background: "none", border: "none", color: "#16a34a", fontWeight: 600, fontSize: 15, cursor: "pointer", padding: "4px 0", marginBottom: 12, fontFamily },
  pageTitle: { fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 16px", fontFamily },
  formRow: { display: "flex", gap: 8 },
  input: { border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily, background: "#fff" },
  addBtn: { width: 44, height: 44, borderRadius: 12, border: "none", background: "#16a34a", color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  listItem: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" },
  listItemLeft: { display: "flex", alignItems: "center", gap: 10 },
  listNum: { width: 26, height: 26, borderRadius: "50%", background: "#dcfce7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  listName: { fontSize: 14, fontWeight: 600, color: "#1f2937" },
  deleteBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "4px 8px", opacity: 0.5 },
  deleteFullBtn: { width: "100%", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily },
  emptyText: { textAlign: "center", color: "#9ca3af", fontSize: 14, padding: 20 },
  emptyCard: { textAlign: "center", background: "#fff", borderRadius: 16, padding: 24, color: "#6b7280", fontSize: 14 },
  hint: { color: "#6b7280", fontSize: 13, margin: "0 0 12px" },
  songPickBtn: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px", cursor: "pointer", width: "100%", fontFamily, fontSize: 15 },
  songPickStat: { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700 },
  legendRow: { display: "flex", gap: 16, marginBottom: 16, justifyContent: "center" },
  legendItem: { fontSize: 12, fontWeight: 600 },
  attendanceBtn: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: "none", cursor: "pointer", width: "100%", fontFamily },
  attendanceNum: { fontSize: 13, fontWeight: 700, color: "#6b7280", width: 22, textAlign: "center" },
  attendanceName: { flex: 1, fontSize: 15, fontWeight: 600, color: "#1f2937", textAlign: "left" },
  statCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" },
  statRank: { fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 },
  progressBar: { height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginTop: 6 },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.4s ease" },
  progressText: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  primaryBtn: { background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 12, fontFamily },
  label: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" },
  settingsGroup: { marginBottom: 20 },
  toast: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#1f2937", color: "#fff", padding: "10px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 1000, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontFamily },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 },
  dialog: { background: "#fff", borderRadius: 20, padding: 24, maxWidth: 340, width: "100%", fontFamily },
  dialogMsg: { fontSize: 15, color: "#1f2937", margin: "0 0 20px", lineHeight: 1.5 },
  dialogBtns: { display: "flex", gap: 10 },
  dialogCancel: { flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily, color: "#374151" },
  dialogConfirm: { flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily },
};
