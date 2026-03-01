import { useState, useEffect } from "react";
import { useGroupContext } from "../contexts/GroupContext";
import { useAuthContext } from "../contexts/AuthContext";
import PageHeader from "../components/layout/PageHeader";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { fmtDate } from "../lib/utils";

export default function SettingsPage() {
  const { group, updateGroup, members, songs, sessions } = useGroupContext();
  const { user, logout } = useAuthContext();
  const [name, setName] = useState(group?.name || "");
  const [startDate, setStartDate] = useState(group?.start_date || "");
  const [dirty, setDirty] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setName(group?.name || "");
    setStartDate(group?.start_date || "");
    setDirty(false);
  }, [group]);

  const handleSave = () => {
    updateGroup({ name, start_date: startDate });
    setDirty(false);
  };

  const linkedMembers = members.filter((m) => m.user_id);

  return (
    <div className="p-5 pb-20">
      <PageHeader title="⚙️ Paramètres" />

      {/* Group info summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider m-0 mb-3">Résumé du groupe</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-kurel-800">{members.length}</div>
            <div className="text-[11px] text-gray-500">Membres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-kurel-800">{songs.length}</div>
            <div className="text-[11px] text-gray-500">Morceaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-kurel-800">{sessions.length}</div>
            <div className="text-[11px] text-gray-500">Séances</div>
          </div>
        </div>
        {group?.created_at && (
          <div className="text-[11px] text-gray-400 text-center mt-3 pt-3 border-t border-gray-100">
            Groupe créé le {fmtDate(group.created_at.slice(0, 10))}
          </div>
        )}
      </div>

      {/* Group settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider m-0 mb-3">Informations du groupe</h3>

        <div className="mb-4">
          <label className="text-[13px] font-semibold text-gray-700 mb-1 block">Nom du groupe</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white box-border focus:border-kurel-600 transition-colors"
            value={name}
            onChange={(e) => { setName(e.target.value); setDirty(true); }}
          />
        </div>

        <div className="mb-1">
          <label className="text-[13px] font-semibold text-gray-700 mb-1 block">Date de début des répétitions</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white box-border focus:border-kurel-600 transition-colors"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setDirty(true); }}
          />
        </div>

        {dirty && (
          <button
            className="w-full bg-kurel-600 text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer font-sans shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:bg-kurel-700 transition-colors mt-4"
            onClick={handleSave}
          >
            Enregistrer les modifications
          </button>
        )}
      </div>

      {/* Admin account */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider m-0 mb-3">Compte administrateur</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-kurel-100 text-kurel-800 flex items-center justify-center text-lg font-bold shrink-0">
            {(user?.user_metadata?.full_name || user?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            {user?.user_metadata?.full_name && (
              <div className="text-sm font-semibold text-gray-800">{user.user_metadata.full_name}</div>
            )}
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-kurel-500"></span>
          {linkedMembers.length} membre{linkedMembers.length !== 1 ? "s" : ""} avec compte lié sur {members.length}
        </div>
      </div>

      {/* Logout */}
      <button
        className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-xl p-3 text-sm font-semibold cursor-pointer font-sans mb-4 hover:bg-gray-200 transition-colors"
        onClick={() => setConfirmAction({ msg: "Êtes-vous sûr de vouloir vous déconnecter ?", action: logout })}
      >
        🚪 Se déconnecter
      </button>

      {/* App info */}
      <div className="text-center text-[11px] text-gray-400 mt-6">
        <p className="m-0">Kurel Tracker v1.0</p>
        <p className="m-0 mt-1">Suivi de répétitions pour groupes musicaux</p>
      </div>

      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.msg}
          onConfirm={() => { confirmAction.action(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
