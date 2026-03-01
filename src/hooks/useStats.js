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

  return { getMemberStats, getSongStats, memberRanking, attendanceMap, generateWhatsAppSummary };
}
