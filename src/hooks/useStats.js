import { useMemo, useCallback } from "react";
import { fmtDate } from "../lib/utils";

const bar = (pct) => {
  const n = Math.round(pct / 10);
  return "█".repeat(n) + "░".repeat(10 - n);
};

export function useStats(members, songs, sessions, attendance, group) {
  // 3-part key: session_member_song
  const attendanceMap = useMemo(() => {
    const map = new Map();
    for (const a of attendance) {
      map.set(`${a.session_id}_${a.member_id}_${a.song_id}`, a);
    }
    return map;
  }, [attendance]);

  const getMemberStats = useCallback((memberId) => {
    const ma = attendance.filter((a) => a.member_id === memberId);
    const p = ma.filter((a) => a.status === "present").length;
    const v = ma.filter((a) => a.status === "vocal").length;
    return { totalPresent: p, totalVocal: v, totalSessions: ma.length, totalValid: p + v };
  }, [attendance]);

  // Sessions that included a given xasiida = distinct session_ids in attendance
  const getSongStats = useCallback((songId) => {
    const sessionIds = new Set(
      attendance.filter((a) => a.song_id === songId).map((a) => a.session_id)
    );
    const song = songs.find((s) => s.id === songId);
    return { completed: sessionIds.size, target: song?.target_reps || 10 };
  }, [attendance, songs]);

  const memberRanking = useMemo(() => {
    const sorted = members
      .map((m) => ({ ...m, stats: getMemberStats(m.id) }))
      .sort((a, b) => b.stats.totalValid - a.stats.totalValid);

    let rank = 1;
    return sorted.map((m, i) => {
      if (i > 0 && m.stats.totalValid < sorted[i - 1].stats.totalValid) rank = i + 1;
      return { ...m, rank };
    });
  }, [members, getMemberStats]);

  const getSongDetailedStats = useCallback((songId) => {
    const song = songs.find((s) => s.id === songId);
    const songSessionIds = new Set(
      attendance.filter((a) => a.song_id === songId).map((a) => a.session_id)
    );
    const songSessions = sessions
      .filter((s) => songSessionIds.has(s.id))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalSessions = songSessions.length;
    const sessionIds = new Set(songSessions.map((s) => s.id));

    const ranking = members
      .map((m) => {
        const songAttendance = attendance.filter(
          (a) => a.member_id === m.id && a.song_id === songId && sessionIds.has(a.session_id)
        );
        const present = songAttendance.filter((a) => a.status === "present").length;
        const vocal = songAttendance.filter((a) => a.status === "vocal").length;
        const valid = present + vocal;
        return { ...m, stats: { totalPresent: present, totalVocal: vocal, totalValid: valid, totalSessions } };
      })
      .sort((a, b) => b.stats.totalValid - a.stats.totalValid);

    let rank = 1;
    const ranked = ranking.map((m, i) => {
      if (i > 0 && m.stats.totalValid < ranking[i - 1].stats.totalValid) rank = i + 1;
      return { ...m, rank };
    });

    const sessionsWithStats = songSessions.map((s) => {
      const sa = attendance.filter((a) => a.session_id === s.id && a.song_id === songId);
      return {
        ...s,
        present: sa.filter((a) => a.status === "present").length,
        vocal: sa.filter((a) => a.status === "vocal").length,
        absent: sa.filter((a) => a.status === "absent").length,
      };
    });

    return { song, completed: totalSessions, target: song?.target_reps || 10, ranking: ranked, sessions: sessionsWithStats };
  }, [members, songs, sessions, attendance]);

  // Share: last session - emoji grid per member × xasiida
  const generateLastSession = useCallback(() => {
    if (!group || sessions.length === 0) return;

    const last = sessions[sessions.length - 1];
    const songIds = [...new Set(attendance.filter((a) => a.session_id === last.id).map((a) => a.song_id))];
    const sessionSongs = songs.filter((s) => songIds.includes(s.id));

    if (sessionSongs.length === 0) return;

    let text = `📊 *${group.name} - ${fmtDate(last.date)}*\n`;
    text += `_${sessionSongs.map((s) => s.name).join(" · ")}_\n\n`;

    members.forEach((m) => {
      const emojis = sessionSongs.map((s) => {
        const a = attendanceMap.get(`${last.id}_${m.id}_${s.id}`);
        return a?.status === "present" ? "✅" : a?.status === "vocal" ? "🎤" : "❌";
      });
      text += `${m.name} : ${emojis.join(" ")}\n`;
    });

    text += `\n_Kurel Tracker_`;
    navigator.clipboard?.writeText(text);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }, [group, members, songs, sessions, attendance, attendanceMap]);

  // Share: full bilan - per-xasiida ranking with progress bars + missed dates
  const generateFullBilan = useCallback(() => {
    if (!group || sessions.length === 0) return;

    let text = `📊 *${group.name} - Bilan (${sessions.length} séances)*\n\n`;

    songs.forEach((song) => {
      const songSessionIds = new Set(
        attendance.filter((a) => a.song_id === song.id).map((a) => a.session_id)
      );
      const songSessions = sessions.filter((s) => songSessionIds.has(s.id));
      if (songSessions.length === 0) return;

      text += `🎵 *${song.name}* (${songSessions.length} séances)\n`;

      const ranked = members
        .map((m) => {
          const ma = attendance.filter((a) => a.song_id === song.id && a.member_id === m.id && songSessionIds.has(a.session_id));
          const valid = ma.filter((a) => a.status !== "absent").length;
          const total = songSessions.length;
          const pct = total > 0 ? Math.round((valid / total) * 100) : 0;
          const missed = songSessions
            .filter((s) => {
              const a = attendanceMap.get(`${s.id}_${m.id}_${song.id}`);
              return !a || a.status === "absent";
            })
            .map((s) => fmtDate(s.date));
          return { m, pct, missed };
        })
        .sort((a, b) => b.pct - a.pct);

      ranked.forEach(({ m, pct, missed }, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        const brackets = pct < 100 && missed.length > 0 ? ` [${missed.join(", ")}]` : "";
        text += `  ${medal} ${m.name.padEnd(14)} ${bar(pct)} ${String(pct).padStart(3)}%${brackets}\n`;
      });

      text += "\n";
    });

    text += `_Kurel Tracker_`;
    navigator.clipboard?.writeText(text);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }, [group, members, songs, sessions, attendance, attendanceMap]);

  return { getMemberStats, getSongStats, getSongDetailedStats, memberRanking, attendanceMap, generateLastSession, generateFullBilan };
}
