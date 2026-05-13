import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import { today } from "../lib/utils";

export default function NewSessionPage() {
  const { songs, members, createSession, addSong } = useGroupContext();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => new Set(songs.map((s) => s.id)));
  const [sessionDate, setSessionDate] = useState(today());
  const [newName, setNewName] = useState("");
  const [newReps, setNewReps] = useState("10");
  const [creating, setCreating] = useState(false);
  const prevSongIdsRef = useRef(new Set(songs.map((s) => s.id)));

  // Auto-select xasiidas added on-the-fly
  useEffect(() => {
    const newIds = songs.map((s) => s.id).filter((id) => !prevSongIdsRef.current.has(id));
    if (newIds.length > 0) {
      setSelected((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });
      prevSongIdsRef.current = new Set(songs.map((s) => s.id));
    }
  }, [songs]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddSong = async () => {
    if (!newName.trim()) return;
    await addSong(newName.trim(), newReps);
    setNewName("");
    setNewReps("10");
  };

  const handleCreate = async () => {
    if (selected.size === 0 || creating) return;
    setCreating(true);
    const sessionId = await createSession([...selected], sessionDate);
    if (sessionId) navigate(`/session/${sessionId}`);
    else setCreating(false);
  };

  if (members.length === 0) {
    return (
      <div className="p-5 pb-20 lg:p-8 lg:pb-8">
        <PageHeader title="📋 Nouvelle Séance" />
        <div className="text-center bg-white rounded-2xl p-6 text-gray-500 text-sm">
          <p>Ajoutez d'abord des membres.</p>
          <button
            className="bg-kurel-600 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer mt-3 font-sans"
            onClick={() => navigate("/members")}
          >
            Ajouter des membres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pb-20 lg:p-8 lg:pb-8">
      <PageHeader title="📋 Nouvelle Séance" />

      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
        <span className="text-lg">📅</span>
        <div className="flex-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Date de la séance</label>
          <input
            type="date"
            className="w-full border-none outline-none text-sm font-semibold text-gray-800 bg-transparent font-sans"
            value={sessionDate}
            max={today()}
            onChange={(e) => setSessionDate(e.target.value)}
          />
        </div>
      </div>

      <p className="text-gray-500 text-[13px] m-0 mb-3">
        Sélectionnez les xasiidas pratiqués :
      </p>

      <div className="flex flex-col gap-2 mb-5">
        {songs.map((song) => (
          <label
            key={song.id}
            className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
              selected.has(song.id) ? "border-kurel-500 bg-kurel-50" : "border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              className="w-4 h-4 accent-kurel-600 shrink-0"
              checked={selected.has(song.id)}
              onChange={() => toggle(song.id)}
            />
            <span className="flex-1 text-sm font-semibold text-gray-800">{song.name}</span>
            <span className="text-xs text-gray-400">{song.target_reps} rép.</span>
          </label>
        ))}

        {songs.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-3">Aucun xasiida encore — ajoutez-en un ci-dessous.</p>
        )}
      </div>

      {/* Inline new xasiida */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 mb-5">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2">Ajouter un nouveau xasiida</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none font-sans bg-white focus:border-kurel-600 transition-colors"
            placeholder="Nom du xasiida"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
          />
          <input
            className="w-14 border border-gray-300 rounded-xl px-2 py-2 text-sm outline-none font-sans bg-white text-center focus:border-kurel-600 transition-colors"
            type="number"
            min="1"
            value={newReps}
            onChange={(e) => setNewReps(e.target.value)}
            placeholder="Rép."
          />
          <button
            className="w-10 h-10 rounded-xl border-none bg-kurel-600 text-white text-lg font-bold cursor-pointer flex items-center justify-center shrink-0"
            onClick={handleAddSong}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="w-full bg-kurel-600 text-white border-none rounded-xl py-3.5 text-[15px] font-bold cursor-pointer font-sans shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-kurel-700 transition-colors disabled:opacity-50"
        onClick={handleCreate}
        disabled={selected.size === 0 || creating}
      >
        {creating ? "Création..." : `Créer la séance · ${selected.size} xasiida${selected.size > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
