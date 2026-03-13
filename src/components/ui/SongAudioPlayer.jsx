export default function SongAudioPlayer({ audioUrl }) {
  if (!audioUrl) return null;

  const isDirectAudio = audioUrl.includes("supabase") && audioUrl.includes("/storage/");

  if (isDirectAudio) {
    return (
      <audio
        controls
        src={audioUrl}
        preload="none"
        className="w-full h-10 mt-2 rounded-lg"
      />
    );
  }

  return (
    <a
      href={audioUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-kurel-600 font-semibold hover:underline mt-2"
    >
      🔗 Écouter (lien externe)
    </a>
  );
}
