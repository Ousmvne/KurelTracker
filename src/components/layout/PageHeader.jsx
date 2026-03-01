import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, backTo = "/" }) {
  const navigate = useNavigate();

  return (
    <>
      <button
        className="bg-transparent border-none text-kurel-600 font-semibold text-[15px] cursor-pointer p-0 mb-3 font-sans"
        onClick={() => navigate(backTo)}
      >
        ← Retour
      </button>
      <h2 className="text-xl font-extrabold text-gray-800 m-0 mb-4 font-sans">{title}</h2>
    </>
  );
}
