import { useState } from "react";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import SongForm from "../components/forms/SongForm";
import ProgressBar from "../components/ui/ProgressBar";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AudioModal from "../components/ui/AudioModal";
import SongAudioPlayer from "../components/ui/SongAudioPlayer";
import EmptyState from "../components/ui/EmptyState";

export default function SongsPage() {
  const { group, songs, addSong, removeSong, updateSongAudio, removeSongAudio, getSongStats } = useGroupContext();
  const [confirmAction, setConfirmAction] = useState(null);
  const [audioModalSong, setAudioModalSong] = useState(null);

  return (
    <div className="p-5 pb-20">
      <PageHeader title={`🎶 Morceaux (${songs.length})`} />
      <SongForm onAdd={addSong} />

      <div className="flex flex-col gap-2">
        {songs.map((song) => {
          const s = getSongStats(song.id);
          const pct = s.target > 0 ? Math.round((s.completed / s.target) * 100) : 0;
          return (
            <div key={song.id} className="bg-white border border-gray-200 rounded-xl px-3.5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{song.name}</div>
                  <ProgressBar percent={pct} />
                  <div className="text-[11px] text-gray-500 mt-1">{s.completed}/{s.target} ({pct}%)</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className={`bg-transparent border-none text-lg cursor-pointer px-2 py-1 transition-opacity ${song.audio_url ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
                    onClick={() => setAudioModalSong(song)}
                  >
                    🎵
                  </button>
                  <button
                    className="bg-transparent border-none text-lg cursor-pointer px-2 py-1 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => setConfirmAction({ msg: `Supprimer "${song.name}" ?`, action: () => removeSong(song.id) })}
                  >
                    🗑
                  </button>
                </div>
              </div>
              {song.audio_url && <SongAudioPlayer audioUrl={song.audio_url} />}
            </div>
          );
        })}
        {songs.length === 0 && <EmptyState>Aucun morceau.</EmptyState>}
      </div>

      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.msg}
          onConfirm={() => { confirmAction.action(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {audioModalSong && (
        <AudioModal
          song={audioModalSong}
          groupId={group.id}
          onClose={() => setAudioModalSong(null)}
          onSave={(songId, url) => { updateSongAudio(songId, url); setAudioModalSong(null); }}
          onRemove={(songId, currentUrl) => { removeSongAudio(songId, currentUrl); setAudioModalSong(null); }}
        />
      )}
    </div>
  );
}
