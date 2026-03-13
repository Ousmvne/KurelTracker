import { createContext, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import { useGroupData } from "../hooks/useGroupData";
import { useMembers } from "../hooks/useMembers";
import { useSongs } from "../hooks/useSongs";
import { useSessions } from "../hooks/useSessions";
import { useGroup } from "../hooks/useGroup";
import { useStats } from "../hooks/useStats";
import { useToast } from "../hooks/useToast";

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { group, setGroup } = useAuthContext();
  const { toast, showToast } = useToast();

  const {
    members, songs, sessions, attendance,
    setMembers, setSongs, setSessions, setAttendance,
    loading, error, refetch,
  } = useGroupData(group?.id);

  const { addMember, removeMember } = useMembers(group?.id, setMembers, setAttendance, showToast);
  const { addSong, removeSong, updateSongAudio, removeSongAudio } = useSongs(group?.id, setSongs, songs, sessions, setSessions, setAttendance, showToast);
  const { createSession, deleteSession, toggleAttendance } = useSessions(group?.id, members, setSessions, setAttendance, showToast);
  const { updateGroup } = useGroup(group, setGroup, showToast);
  const { getMemberStats, getSongStats, getSongDetailedStats, memberRanking, attendanceMap, generateWhatsAppSummary } = useStats(members, songs, sessions, attendance, group);

  const value = {
    group, members, songs, sessions, attendance,
    loading, error, refetch,
    addMember, removeMember,
    addSong, removeSong, updateSongAudio, removeSongAudio,
    createSession, deleteSession, toggleAttendance,
    updateGroup,
    getMemberStats, getSongStats, getSongDetailedStats, memberRanking, attendanceMap,
    generateWhatsAppSummary,
    toast, showToast,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroupContext() {
  const context = useContext(GroupContext);
  if (!context) throw new Error("useGroupContext must be used within GroupProvider");
  return context;
}
