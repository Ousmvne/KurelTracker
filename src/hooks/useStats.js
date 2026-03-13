import { useMemo, useCallback } from "react";
import { fmtDate } from "../lib/utils";

export function useStats(members, songs, sessions, attendance, group) {
  const attendanceMap = useMemo(() => {
    const map = new Map();
    for (const a of attendance) {
      map.set(`${a.session_id}_${a.member_id}`, a);
    }
    return map;
  }, [attendance]);

  const getMemberStats = useCallback((memberId) => {
    const ma = attendance.filter((a) => a.member_id === memberId);
    const p = ma.filter((a) => a.status === "present").length;
    const v = ma.filter((a) => a.status === "vocal").length;
    return { totalPresent: p, totalVocal: v, totalSessions: sessions.length, totalValid: p + v };
  }, [attendance, sessions.length]);

  const getSongStats = useCallback((songId) => {
    const ss = sessions.filter((s) => s.song_id === songId);
    const song = songs.find((s) => s.id === songId);
    return { completed: ss.length, target: song?.target_reps || 10 };
  }, [sessions, songs]);

  const memberRanking = useMemo(() => {
    const sorted = members
      .map((m) => ({ ...m, stats: getMemberStats(m.id) }))
      .sort((a, b) => b.stats.totalValid - a.stats.totalValid);

    let rank = 1;
    return sorted.map((m, i) => {
      if (i > 0 && m.stats.totalValid < sorted[i - 1].stats.totalValid) {
        rank = i + 1;
      }
      return { ...m, rank };
    });
  }, [members, getMemberStats]);

  const generateWhatsAppSummary = useCallback(() => {
    if (!group) return;
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
        const a = attendanceMap.get(`${session.id}_${member.id}`);
        text += a?.status === "present" ? "✅" : a?.status === "vocal" ? "🎤" : "❌";
      });
      text += ` (${s.totalValid}/${s.totalSessions})\n`;
    });

    text += `\n_Généré par Kurel Tracker_`;
    navigator.clipboard?.writeText(text);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, [group, members, songs, sessions, attendanceMap, getMemberStats, getSongStats]);

  const getSongDetailedStats = useCallback((songId) => {
    const song = songs.find((s) => s.id === songId);
    const songSessions = sessions
      .filter((s) => s.song_id === songId)
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalSessions = songSessions.length;
    const sessionIds = new Set(songSessions.map((s) => s.id));

    const ranking = members
      .map((m) => {
        const songAttendance = attendance.filter(
          (a) => a.member_id === m.id && sessionIds.has(a.session_id)
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
      const sa = attendance.filter((a) => a.session_id === s.id);
      const present = sa.filter((a) => a.status === "present").length;
      const vocal = sa.filter((a) => a.status === "vocal").length;
      const absent = sa.filter((a) => a.status === "absent").length;
      return { ...s, present, vocal, absent };
    });

    return {
      song,
      completed: totalSessions,
      target: song?.target_reps || 10,
      ranking: ranked,
      sessions: sessionsWithStats,
    };
  }, [members, songs, sessions, attendance]);

  return { getMemberStats, getSongStats, getSongDetailedStats, memberRanking, attendanceMap, generateWhatsAppSummary };
}
