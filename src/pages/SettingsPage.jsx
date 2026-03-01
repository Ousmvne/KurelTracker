import { useState, useEffect } from "react";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";

export default function SettingsPage() {
  const { group, updateGroup } = useGroupContext();
  const [name, setName] = useState(group?.name || "");
  const [startDate, setStartDate] = useState(group?.start_date || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setName(group?.name || "");
    setStartDate(group?.start_date || "");
    setDirty(false);
  }, [group]);

  const handleSave = () => {
    updateGroup({ name, start_date: startDate });
    setDirty(false);
  };

  return (
    <div className="p-5 pb-20">
      <PageHeader title="⚙️ Paramètres" />

      <div className="mb-5">
        <label className="text-[13px] font-semibold text-gray-700 mb-1 block">Nom du groupe</label>
        <input
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white box-border focus:border-kurel-600 transition-colors"
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true); }}
        />
      </div>

      <div className="mb-5">
        <label className="text-[13px] font-semibold text-gray-700 mb-1 block">Date de début</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white box-border focus:border-kurel-600 transition-colors"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setDirty(true); }}
        />
      </div>

      {dirty && (
        <button
          className="w-full bg-kurel-600 text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer font-sans shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:bg-kurel-700 transition-colors"
          onClick={handleSave}
        >
          Enregistrer les modifications
        </button>
      )}
    </div>
  );
}
