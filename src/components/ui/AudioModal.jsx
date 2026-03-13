import { useState } from "react";
import { supabase } from "../../lib/supabase";

const MAX_SIZE = 20 * 1024 * 1024;

export default function AudioModal({ song, groupId, onClose, onSave, onRemove }) {
  const [mode, setMode] = useState("upload");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (mode === "url") {
      if (!url.trim() || !url.startsWith("http")) return;
      onSave(song.id, url.trim());
      return;
    }

    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("Fichier trop volumineux (max 20 Mo)");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${groupId}/${song.id}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("song-audio").upload(filePath, file);
    if (error) {
      setUploading(false);
      alert("Erreur lors de l'envoi du fichier");
      return;
    }

    const { data } = supabase.storage.from("song-audio").getPublicUrl(filePath);
    setUploading(false);
    onSave(song.id, data.publicUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-5">
      <div className="bg-white rounded-[20px] p-6 max-w-[380px] w-full font-sans">
        <h3 className="text-[15px] font-bold text-gray-800 m-0 mb-4">
          Audio pour « {song.name} »
        </h3>

        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer font-sans border-none ${mode === "upload" ? "bg-kurel-600 text-white" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setMode("upload")}
          >
            Fichier
          </button>
          <button
            className={`flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer font-sans border-none ${mode === "url" ? "bg-kurel-600 text-white" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setMode("url")}
          >
            Lien externe
          </button>
        </div>

        {mode === "upload" ? (
          <div className="mb-4">
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-kurel-600 transition-colors">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-sm text-gray-500">
                {file ? file.name : "Choisir un fichier audio"}
              </div>
            </label>
          </div>
        ) : (
          <div className="mb-4">
            <input
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white focus:border-kurel-600 transition-colors"
              type="text"
              placeholder="https://youtube.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        {song.audio_url && (
          <button
            className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-2.5 text-sm font-semibold cursor-pointer font-sans mb-4"
            onClick={() => onRemove(song.id, song.audio_url)}
          >
            Supprimer l'audio actuel
          </button>
        )}

        <div className="flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold cursor-pointer font-sans text-gray-700"
            onClick={onClose}
            disabled={uploading}
          >
            Annuler
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl border-none bg-kurel-600 text-white text-sm font-semibold cursor-pointer font-sans disabled:opacity-50"
            onClick={handleSave}
            disabled={uploading || (mode === "upload" ? !file : !url.trim())}
          >
            {uploading ? "Envoi..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
