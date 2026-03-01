export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-5">
      <div className="bg-white rounded-[20px] p-6 max-w-[340px] w-full font-sans">
        <p className="text-[15px] text-gray-800 m-0 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold cursor-pointer font-sans text-gray-700"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl border-none bg-red-600 text-white text-sm font-semibold cursor-pointer font-sans"
            onClick={onConfirm}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
