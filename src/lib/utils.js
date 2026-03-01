export const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export const today = () => new Date().toISOString().slice(0, 10);

export const ATTENDANCE_CONFIG = {
  present: { label: "Présent", color: "text-green-600", bg: "bg-green-100", border: "border-green-600", icon: "✅" },
  vocal: { label: "Vocal", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-600", icon: "🎤" },
  absent: { label: "Absent", color: "text-red-600", bg: "bg-red-100", border: "border-red-600", icon: "❌" },
};

export const ATTENDANCE_CYCLE = ["absent", "present", "vocal"];

/**
 * Wraps a Supabase query with consistent error handling.
 * Returns { data, error } — never throws.
 */
export async function safeQuery(queryFn) {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error("[Supabase Error]", error.message);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    console.error("[Unexpected Error]", err);
    return { data: null, error: "Une erreur inattendue est survenue." };
  }
}
