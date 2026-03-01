import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kurel-tracker-data";

const defaultData = {
  groupName: "KUREL HTDKH T.FR",
  startDate: "2025-11-15",
  members: [],
  songs: [],
  sessions: [],
};

const uid = () => Math.random().toString(36).slice(2, 9);

const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [activeSession, setActiveSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setData({ ...defaultData });
    }
    setLoading(false);
  }, []);

  // Save to localStorage
  const save = useCallback((newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ——— MEMBERS ———
  const addMember = (name) => {
    if (!name.trim()) return;
    const newData = {
      ...data,
      members: [...data.members, { id: uid(), name: name.trim(), active: true }],
    };
    save(newData);
    showToast("Membre ajouté ✓");
  };

  const removeMember = (id) => {
    const newData = {
      ...data,
      members: data.members.filter((m) => m.id !== id),
      sessions: data.sessions.map((s) => ({
        ...s,
        attendance: Object.fromEntries(
          Object.entries(s.attendance).filter(([k]) => k !== id)
        ),
      })),
    };
    save(newData);
    showToast("Membre supprimé");
  };

  // ——— SONGS ———
  const addSong = (name, targetReps) => {
    if (!name.trim()) return;
    const newData = {
      ...data,
      songs: [
        ...data.songs,
        { id: uid(), name: name.trim(), targetReps: parseInt(targetReps) || 10 },
      ],
    };
    save(newData);
    showToast("Morceau ajouté ✓");
  };

  const removeSong = (id) => {
    const newData = {
      ...data,
      songs: data.songs.filter((s) => s.id !== id),
      sessions: data.sessions.filter((s) => s.songId !== id),
    };
    save(newData);
    showToast("Morceau supprimé");
  };

  // ——— SESSIONS ———
  const createSession = (songId, date) => {
    const session = {
      id: uid(),
      songId,
      date: date || today(),
      attendance: {},
    };
    data.members.forEach((m) => {
      session.attendance[m.id] = "absent";
    });
    const newData = { ...data, sessions: [...data.sessions, session] };
    save(newData);
    setActiveSession(session.id);
    setView("session");
    showToast("Séance créée ✓");
  };

  const toggleAttendance = (sessionId, memberId) => {
    const states = ["absent", "present", "vocal"];
    const newData = { ...data };
    const session = newData.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const current = session.attendance[memberId] || "absent";
    const next = states[(states.indexOf(current) + 1) % states.length];
    session.attendance[memberId] = next;
    save({ ...newData });
  };

  const deleteSession = (sessionId) => {
    const newData = {
      ...data,
      sessions: data.sessions.filter((s) => s.id !== sessionId),
    };
    save(newData);
    showToast("Séance supprimée");
    if (activeSession === sessionId) {
      setView("home");
      setActiveSession(null);
    }
  };

  // ——— STATS ———
  const getMemberStats = (memberId) => {
    let totalPresent = 0;
    let totalVocal = 0;
    let totalSessions = data.sessions.length;
    data.sessions.forEach((s) => {
      if (s.attendance[memberId] === "present") totalPresent++;
      if (s.attendance[memberId] === "vocal") totalVocal++;
    });
    return { totalPresent, totalVocal, totalSessions, totalValid: totalPresent + totalVocal };
  };

  const getSongStats = (songId) => {
    const songSessions = data.sessions.filter((s) => s.songId === songId);
    const song = data.songs.find((s) => s.id === songId);
    return {
      completed: songSessions.length,
      target: song?.targetReps || 10,
      sessions: songSessions,
    };
  };

  // ——— WHATSAPP SHARE ———
  const generateWhatsAppSummary = () => {
    let text = `*SUIVI RÉPÉTITIONS ${data.groupName}*\n\n`;
    text += `• Début officiel : ${fmtDate(data.startDate)}\n`;
    text += `• Répétitions globales : ${data.sessions.length}\n\n`;

    data.songs.forEach((song) => {
      const stats = getSongStats(song.id);
      text += `*${song.name}* (${stats.completed}/${stats.target})\n`;
    });

    text += `\n`;

    data.members.forEach((member, i) => {
      const stats = getMemberStats(member.id);
      const presence = stats.totalValid;
      const total = stats.totalSessions;
      text += `${i + 1}. S. ${member.name} `;

      data.sessions.forEach((session) => {
        const status = session.attendance[member.id];
        if (status === "present") text += "✅";
        else if (status === "vocal") text += "🎤";
        else text += "❌";
      });
      text += ` (${presence}/${total})\n`;
    });

    text += `\n_Généré par Kurel Tracker_`;

    navigator.clipboard?.writeText(text);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    showToast("Résumé copié et WhatsApp ouvert ✓");
  };

  // ——— RESET ———
  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({ ...defaultData });
    setView("home");
    showToast("Données réinitialisées");
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: "#555", marginTop: 16, fontFamily }}>Chargement...</p>
      </div>
    );
  }

  // ——— RENDER VIEWS ———
  const renderHome = () => (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroIcon}>🎵</div>
        <h1 style={styles.heroTitle}>{data.groupName}</h1>
        <p style={styles.heroSub}>
          Depuis le {fmtDate(data.startDate)} • {data.members.length} membres •{" "}
          {data.sessions.length} séances
        </p>
      </div>

      <div style={styles.grid}>
        <button style={styles.gridBtn} onClick={() => setView("members")}>
          <span style={styles.gridIcon}>👥</span>
          <span style={styles.gridLabel}>Membres</span>
          <span style={styles.gridCount}>{data.members.length}</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("songs")}>
          <span style={styles.gridIcon}>🎶</span>
          <span style={styles.gridLabel}>Morceaux</span>
          <span style={styles.gridCount}>{data.songs.length}</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("newSession")}>
          <span style={styles.gridIcon}>📋</span>
          <span style={styles.gridLabel}>Nouvelle Séance</span>
          <span style={styles.gridCount}>+</span>
        </button>
        <button style={styles.gridBtn} onClick={() => setView("stats")}>
          <span style={styles.gridIcon}>📊</span>
          <span style={styles.gridLabel}>Statistiques</span>
          <span style={styles.gridCount}>→</span>
        </button>
      </div>

      {data.sessions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Séances récentes</h3>
          {data.sessions
            .slice(-5)
            .reverse()
            .map((session) => {
              const song = data.songs.find((s) => s.id === session.songId);
              const presentCount = Object.values(session.attendance).filter(
                (v) => v === "present"
              ).length;
              const vocalCount = Object.values(session.attendance).filter(
                (v) => v === "vocal"
              ).length;
              return (
                <button
                  key={session.id}
                  style={styles.sessionCard}
                  onClick={() => {
                    setActiveSession(session.id);
                    setView("session");
                  }}
                >
                  <div>
                    <div style={styles.sessionSong}>{song?.name || "—"}</div>
                    <div style={styles.sessionDate}>{fmtDate(session.date)}</div>
                  </div>
                  <div style={styles.sessionBadges}>
                    <span style={styles.badgeGreen}>✅ {presentCount}</span>
                    <span style={styles.badgeBlue}>🎤 {vocalCount}</span>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      <div style={{ ...styles.section, marginTop: 8 }}>
        <button style={styles.whatsappBtn} onClick={generateWhatsAppSummary}>
          <span style={{ fontSize: 20 }}>📱</span>
          Partager sur WhatsApp
        </button>
      </div>

      <button style={styles.settingsLink} onClick={() => setView("settings")}>
        ⚙️ Paramètres
      </button>
    </div>
  );

  const renderMembers = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>
        ← Retour
      </button>
      <h2 style={styles.pageTitle}>👥 Membres ({data.members.length})</h2>
      <MemberForm onAdd={addMember} />
      <div style={styles.list}>
        {data.members.map((member, i) => (
          <div key={member.id} style={styles.listItem}>
            <div style={styles.listItemLeft}>
              <span style={styles.listNum}>{i + 1}</span>
              <span style={styles.listName}>{member.name}</span>
            </div>
            <button
              style={styles.deleteBtn}
              onClick={() =>
                setConfirmAction({
                  msg: `Supprimer ${member.name} ?`,
                  action: () => removeMember(member.id),
                })
              }
            >
              🗑
            </button>
          </div>
        ))}
        {data.members.length === 0 && (
          <p style={styles.emptyText}>Aucun membre. Ajoutez-en un ci-dessus.</p>
        )}
      </div>
    </div>
  );

  const renderSongs = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>
        ← Retour
      </button>
      <h2 style={styles.pageTitle}>🎶 Morceaux ({data.songs.length})</h2>
      <SongForm onAdd={addSong} />
      <div style={styles.list}>
        {data.songs.map((song) => {
          const stats = getSongStats(song.id);
          const pct = stats.target > 0 ? Math.round((stats.completed / stats.target) * 100) : 0;
          return (
            <div key={song.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={styles.listName}>{song.name}</div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: pct >= 100 ? "#16a34a" : "#f59e0b",
                    }}
                  />
                </div>
                <div style={styles.progressText}>
                  {stats.completed}/{stats.target} répétitions ({pct}%)
                </div>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={() =>
                  setConfirmAction({
                    msg: `Supprimer "${song.name}" et ses séances ?`,
                    action: () => removeSong(song.id),
                  })
                }
              >
                🗑
              </button>
            </div>
          );
        })}
        {data.songs.length === 0 && (
          <p style={styles.emptyText}>Aucun morceau. Ajoutez-en un ci-dessus.</p>
        )}
      </div>
    </div>
  );

  const renderNewSession = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>
        ← Retour
      </button>
      <h2 style={styles.pageTitle}>📋 Nouvelle Séance</h2>
      {data.songs.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>Ajoutez d'abord un morceau avant de créer une séance.</p>
          <button style={styles.primaryBtn} onClick={() => setView("songs")}>
            Ajouter un morceau
          </button>
        </div>
      ) : data.members.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>Ajoutez d'abord des membres avant de créer une séance.</p>
          <button style={styles.primaryBtn} onClick={() => setView("members")}>
            Ajouter des membres
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          <p style={styles.hint}>Choisissez le morceau pour cette séance :</p>
          {data.songs.map((song) => {
            const stats = getSongStats(song.id);
            return (
              <button
                key={song.id}
                style={styles.songPickBtn}
                onClick={() => createSession(song.id)}
              >
                <span style={{ fontWeight: 600 }}>{song.name}</span>
                <span style={styles.songPickStat}>
                  {stats.completed}/{stats.target}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSession = () => {
    const session = data.sessions.find((s) => s.id === activeSession);
    if (!session) {
      setView("home");
      return null;
    }
    const song = data.songs.find((s) => s.id === session.songId);

    const statusConfig = {
      present: { label: "Présent", color: "#16a34a", bg: "#dcfce7", icon: "✅" },
      vocal: { label: "Vocal", color: "#2563eb", bg: "#dbeafe", icon: "🎤" },
      absent: { label: "Absent", color: "#dc2626", bg: "#fee2e2", icon: "❌" },
    };

    return (
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => setView("home")}>
          ← Retour
        </button>
        <div style={styles.sessionHeader}>
          <h2 style={styles.pageTitle}>
            {song?.name || "Séance"} — {fmtDate(session.date)}
          </h2>
          <p style={styles.hint}>
            Tapez sur un membre pour changer son statut : Absent → Présent → Vocal
          </p>
        </div>

        <div style={styles.legendRow}>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <span key={key} style={{ ...styles.legendItem, color: cfg.color }}>
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>

        <div style={styles.list}>
          {data.members.map((member, i) => {
            const status = session.attendance[member.id] || "absent";
            const cfg = statusConfig[status];
            return (
              <button
                key={member.id}
                style={{
                  ...styles.attendanceBtn,
                  backgroundColor: cfg.bg,
                  borderLeft: `4px solid ${cfg.color}`,
                }}
                onClick={() => toggleAttendance(session.id, member.id)}
              >
                <span style={styles.attendanceNum}>{i + 1}</span>
                <span style={styles.attendanceName}>{member.name}</span>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
              </button>
            );
          })}
        </div>

        <button
          style={{ ...styles.deleteFullBtn, marginTop: 20 }}
          onClick={() =>
            setConfirmAction({
              msg: "Supprimer cette séance ?",
              action: () => deleteSession(session.id),
            })
          }
        >
          🗑 Supprimer cette séance
        </button>
      </div>
    );
  };

  const renderStats = () => (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("home")}>
        ← Retour
      </button>
      <h2 style={styles.pageTitle}>📊 Statistiques</h2>

      {data.members.length === 0 || data.sessions.length === 0 ? (
        <p style={styles.emptyText}>
          Pas encore de données. Créez des séances et marquez la présence.
        </p>
      ) : (
        <>
          <h3 style={styles.sectionTitle}>Classement membres</h3>
          <div style={styles.list}>
            {data.members
              .map((m) => ({ ...m, stats: getMemberStats(m.id) }))
              .sort((a, b) => b.stats.totalValid - a.stats.totalValid)
              .map((member, i) => {
                const pct =
                  member.stats.totalSessions > 0
                    ? Math.round(
                        (member.stats.totalValid / member.stats.totalSessions) * 100
                      )
                    : 0;
                return (
                  <div key={member.id} style={styles.statCard}>
                    <div style={styles.statRank}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.listName}>{member.name}</div>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${pct}%`,
                            backgroundColor:
                              pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626",
                          }}
                        />
                      </div>
                      <div style={styles.progressText}>
                        ✅ {member.stats.totalPresent} présent • 🎤{" "}
                        {member.stats.totalVocal} vocal • {pct}% assiduité
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <h3 style={{ ...styles.sectionTitle, marginTop: 24 }}>Avancement morceaux</h3>
          <div style={styles.list}>
            {data.songs.map((song) => {
              const stats = getSongStats(song.id);
              const pct =
                stats.target > 0
                  ? Math.round((stats.completed / stats.target) * 100)
                  : 0;
              return (
                <div key={song.id} style={styles.statCard}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.listName}>{song.name}</div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct >= 100 ? "#16a34a" : "#f59e0b",
                        }}
                      />
                    </div>
                    <div style={styles.progressText}>
                      {stats.completed}/{stats.target} ({pct}%)
                    </div>
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
      <button style={styles.backBtn} onClick={() => setView("home")}>
        ← Retour
      </button>
      <h2 style={styles.pageTitle}>⚙️ Paramètres</h2>

      <div style={styles.settingsGroup}>
        <label style={styles.label}>Nom du groupe</label>
        <input
          style={styles.input}
          value={data.groupName}
          onChange={(e) => save({ ...data, groupName: e.target.value })}
        />
      </div>

      <div style={styles.settingsGroup}>
        <label style={styles.label}>Date de début officiel</label>
        <input
          type="date"
          style={styles.input}
          value={data.startDate}
          onChange={(e) => save({ ...data, startDate: e.target.value })}
        />
      </div>

      <button
        style={{ ...styles.deleteFullBtn, marginTop: 32 }}
        onClick={() =>
          setConfirmAction({
            msg: "⚠️ Réinitialiser TOUTES les données ? Cette action est irréversible.",
            action: resetAll,
          })
        }
      >
        🗑 Réinitialiser toutes les données
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background: #e8f5e9;
        }
        @media (min-width: 640px) {
          #root {
            display: flex;
            justify-content: center;
            padding: 24px 0;
          }
          #root > div {
            border-radius: 20px;
            min-height: calc(100vh - 48px);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.app}>
      {toast && <div style={styles.toast}>{toast}</div>}

      {confirmAction && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <p style={styles.dialogMsg}>{confirmAction.msg}</p>
            <div style={styles.dialogBtns}>
              <button
                style={styles.dialogCancel}
                onClick={() => setConfirmAction(null)}
              >
                Annuler
              </button>
              <button
                style={styles.dialogConfirm}
                onClick={() => {
                  confirmAction.action();
                  setConfirmAction(null);
                }}
              >
                Confirmer
              </button>
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

// ——— Small form components ———
function MemberForm({ onAdd }) {
  const [name, setName] = useState("");
  return (
    <div style={styles.formRow}>
      <input
        style={{ ...styles.input, flex: 1 }}
        placeholder="Nom du membre (ex: Cheikh Abdou Ndao)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(name);
            setName("");
          }
        }}
      />
      <button
        style={styles.addBtn}
        onClick={() => {
          onAdd(name);
          setName("");
        }}
      >
        +
      </button>
    </div>
  );
}

function SongForm({ onAdd }) {
  const [name, setName] = useState("");
  const [reps, setReps] = useState("10");
  return (
    <div style={styles.formRow}>
      <input
        style={{ ...styles.input, flex: 1 }}
        placeholder="Nom du morceau"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        style={{ ...styles.input, width: 60, textAlign: "center" }}
        type="number"
        placeholder="Rép."
        value={reps}
        onChange={(e) => setReps(e.target.value)}
      />
      <button
        style={styles.addBtn}
        onClick={() => {
          onAdd(name, reps);
          setName("");
          setReps("10");
        }}
      >
        +
      </button>
    </div>
  );
}

// ——— STYLES ———
const fontFamily = "'Segoe UI', 'SF Pro Display', -apple-system, sans-serif";

const styles = {
  app: {
    fontFamily,
    width: "100%",
    maxWidth: 600,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f0fdf4 0%, #fefce8 100%)",
    position: "relative",
    boxShadow: "0 0 40px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily,
  },
  loadingSpinner: {
    width: 36,
    height: 36,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #16a34a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  page: {
    padding: "20px 20px 80px",
  },
  heroCard: {
    background: "linear-gradient(135deg, #166534 0%, #15803d 60%, #22c55e 100%)",
    borderRadius: 20,
    padding: "32px 20px 24px",
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
    boxShadow: "0 8px 32px rgba(22,101,52,0.3)",
  },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroTitle: {
    fontSize: 20,
    fontWeight: 800,
    margin: "0 0 6px",
    letterSpacing: 0.5,
  },
  heroSub: { fontSize: 13, opacity: 0.85, margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 24,
  },
  gridBtn: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "18px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.15s",
    fontFamily,
  },
  gridIcon: { fontSize: 28 },
  gridLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  gridCount: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: 700,
    background: "#dcfce7",
    borderRadius: 10,
    padding: "2px 10px",
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#374151",
    margin: "0 0 10px",
    fontFamily,
  },
  sessionCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    width: "100%",
    fontFamily,
    textAlign: "left",
  },
  sessionSong: { fontWeight: 600, fontSize: 14, color: "#1f2937" },
  sessionDate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  sessionBadges: { display: "flex", gap: 8 },
  badgeGreen: {
    fontSize: 12,
    background: "#dcfce7",
    color: "#166534",
    padding: "3px 8px",
    borderRadius: 8,
    fontWeight: 600,
  },
  badgeBlue: {
    fontSize: 12,
    background: "#dbeafe",
    color: "#1e40af",
    padding: "3px 8px",
    borderRadius: 8,
    fontWeight: 600,
  },
  whatsappBtn: {
    width: "100%",
    background: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px 20px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily,
    boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
  },
  settingsLink: {
    display: "block",
    margin: "20px auto 0",
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    fontFamily,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#16a34a",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    padding: "4px 0",
    marginBottom: 12,
    fontFamily,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 16px",
    fontFamily,
  },
  formRow: { display: "flex", gap: 8, marginBottom: 16 },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily,
    background: "#fff",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "12px 14px",
  },
  listItemLeft: { display: "flex", alignItems: "center", gap: 10 },
  listNum: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  listName: { fontSize: 14, fontWeight: 600, color: "#1f2937" },
  deleteBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
    opacity: 0.5,
  },
  deleteFullBtn: {
    width: "100%",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily,
  },
  emptyText: { textAlign: "center", color: "#9ca3af", fontSize: 14, padding: 20 },
  emptyCard: {
    textAlign: "center",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    color: "#6b7280",
    fontSize: 14,
  },
  hint: { color: "#6b7280", fontSize: 13, margin: "0 0 12px" },
  songPickBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "16px",
    cursor: "pointer",
    width: "100%",
    fontFamily,
    fontSize: 15,
  },
  songPickStat: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
  },
  sessionHeader: { marginBottom: 12 },
  legendRow: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  legendItem: { fontSize: 12, fontWeight: 600 },
  attendanceBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    width: "100%",
    fontFamily,
    transition: "background 0.15s",
  },
  attendanceNum: {
    fontSize: 13,
    fontWeight: 700,
    color: "#6b7280",
    width: 22,
    textAlign: "center",
  },
  attendanceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 600,
    color: "#1f2937",
    textAlign: "left",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "12px 14px",
  },
  statRank: { fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 },
  progressBar: {
    height: 6,
    background: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  progressText: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 12,
    fontFamily,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
    display: "block",
  },
  settingsGroup: { marginBottom: 20 },
  toast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1f2937",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 1000,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    fontFamily,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  dialog: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    maxWidth: 340,
    width: "100%",
    fontFamily,
  },
  dialogMsg: { fontSize: 15, color: "#1f2937", margin: "0 0 20px", lineHeight: 1.5 },
  dialogBtns: { display: "flex", gap: 10 },
  dialogCancel: {
    flex: 1,
    padding: "10px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily,
    color: "#374151",
  },
  dialogConfirm: {
    flex: 1,
    padding: "10px",
    borderRadius: 12,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily,
  },
};