import { useNavigate } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";

export default function NewSessionPage() {
  const { songs, members, getSongStats, createSession } = useGroupContext();
  const navigate = useNavigate();

  const handleCreate = async (songId) => {
    const sessionId = await createSession(songId);
    if (sessionId) navigate(`/session/${sessionId}`);
  };

  if (songs.length === 0) {
    return (
      <div className="p-5 pb-20">
        <PageHeader title="📋 Nouvelle Séance" />
        <div className="text-center bg-white rounded-2xl p-6 text-gray-500 text-sm">
          <p>Ajoutez d'abord un morceau.</p>
          <button
            className="bg-kurel-600 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer mt-3 font-sans"
            onClick={() => navigate("/songs")}
          >
            Ajouter un morceau
          </button>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-5 pb-20">
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
    <div className="p-5 pb-20">
      <PageHeader title="📋 Nouvelle Séance" />
      <p className="text-gray-500 text-[13px] m-0 mb-3">Choisissez le morceau :</p>
      <div className="flex flex-col gap-2">
        {songs.map((song) => {
          const s = getSongStats(song.id);
          return (
            <button
              key={song.id}
              className="flex justify-between items-center bg-white border border-gray-200 rounded-[14px] p-4 cursor-pointer w-full font-sans text-[15px] hover:shadow-md transition-shadow"
              onClick={() => handleCreate(song.id)}
            >
              <span className="font-semibold">{song.name}</span>
              <span className="bg-kurel-100 text-kurel-800 px-2.5 py-1 rounded-lg text-[13px] font-bold">
                {s.completed}/{s.target}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
