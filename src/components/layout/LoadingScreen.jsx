export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen font-sans">
      <div className="w-9 h-9 border-3 border-gray-200 border-t-kurel-600 rounded-full animate-spin" />
      <p className="text-gray-500 mt-4">Chargement...</p>
    </div>
  );
}
