import { useState } from "react";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import MemberForm from "../components/forms/MemberForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";

export default function MembersPage() {
  const { members, addMember, removeMember } = useGroupContext();
  const [confirmAction, setConfirmAction] = useState(null);

  return (
    <div className="p-5 pb-20">
      <PageHeader title={`👥 Membres (${members.length})`} />
      <MemberForm onAdd={addMember} />

      <div className="flex flex-col gap-2">
        {members.map((m, i) => (
          <div key={m.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="w-[26px] h-[26px] rounded-full bg-kurel-100 text-kurel-800 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-800">{m.name}</span>
                {m.email && <div className="text-[11px] text-gray-500">{m.email}</div>}
                {m.user_id && <div className="text-[10px] text-kurel-600">✓ Compte lié</div>}
              </div>
            </div>
            <button
              className="bg-transparent border-none text-lg cursor-pointer px-2 py-1 opacity-50 hover:opacity-100 transition-opacity"
              onClick={() => setConfirmAction({ msg: `Supprimer ${m.name} ?`, action: () => removeMember(m.id) })}
            >
              🗑
            </button>
          </div>
        ))}
        {members.length === 0 && <EmptyState>Aucun membre.</EmptyState>}
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
