import { useState } from "react";

const STEPS = [
  {
    icon: "🎵",
    title: "Bienvenue sur Kurel Tracker",
    desc: "Suivez la présence de votre groupe à chaque xasiida, séance après séance. Ce guide rapide vous explique comment démarrer.",
  },
  {
    icon: "👥",
    title: "Ajoutez vos membres",
    desc: "Dans la section Membres, ajoutez chaque participant. Vous pouvez renseigner leur email pour qu'ils puissent se connecter et voir leurs stats.",
  },
  {
    icon: "🎶",
    title: "Ajoutez vos xasiidas",
    desc: "Dans Xasiidas, ajoutez les chants à travailler et indiquez le nombre de répétitions cibles pour suivre la progression.",
  },
  {
    icon: "📋",
    title: "Créez une séance",
    desc: "Appuyez sur Nouvelle Séance, cochez les xasiidas pratiqués ce jour-là. Vous pouvez aussi ajouter un nouveau xasiida directement depuis cette page.",
  },
  {
    icon: "✅",
    title: "Marquez la présence",
    desc: "Sur la page de séance, tapez sur chaque case pour basculer entre ❌ Absent, ✅ Présent et 🎤 Vocal. Les modifications sont sauvegardées automatiquement.",
  },
  {
    icon: "📊",
    title: "Partagez les statistiques",
    desc: "Depuis l'accueil ou les statistiques, partagez un résumé WhatsApp de la dernière séance ou un bilan complet par xasiida avec classement.",
  },
];

export default function TutorialModal({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-6xl mb-4">{current.icon}</div>
          <h2 className="text-[17px] font-bold text-gray-800 mb-2 leading-snug">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-kurel-600" : "w-1.5 bg-gray-200"}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!isLast && (
            <button
              className="flex-1 bg-gray-100 text-gray-500 border-none rounded-xl py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Passer
            </button>
          )}
          <button
            className={`${isLast ? "w-full" : "flex-[2]"} bg-kurel-600 text-white border-none rounded-xl py-2.5 text-sm font-bold cursor-pointer font-sans hover:bg-kurel-700 transition-colors`}
            onClick={isLast ? onClose : () => setStep((s) => s + 1)}
          >
            {isLast ? "C'est parti ✓" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}
