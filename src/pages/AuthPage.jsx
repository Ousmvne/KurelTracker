import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function AuthPage() {
  const { login, signup, forgotPassword, error, message, clearError, clearMessage, loading } = useAuthContext();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const switchMode = (m) => {
    setMode(m);
    clearError();
    clearMessage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login") await login(email, password);
    else if (mode === "signup") {
      await signup(email, password, name);
      setMode("login");
    }
    else await forgotPassword(email);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-kurel-950 via-kurel-800 to-kurel-500 p-5 box-border relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-[120px] -left-[120px] w-[350px] h-[350px] rounded-full bg-white/5" />
      <div className="absolute -bottom-[80px] -right-[80px] w-[280px] h-[280px] rounded-full bg-white/5" />
      <div className="absolute top-[20%] right-[10%] w-[150px] h-[150px] rounded-full bg-white/[0.03]" />
      <div className="absolute bottom-[30%] left-[5%] w-[100px] h-[100px] rounded-full bg-white/[0.04]" />

      <div className="bg-white/[0.97] rounded-[28px] px-8 pt-12 pb-10 max-w-[420px] w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-[10px] relative z-10">
        <div className="text-6xl mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]">🎵</div>
        <h1 className="text-[28px] font-extrabold text-gray-800 m-0 mb-1.5 font-sans -tracking-[0.5px]">Kurel Tracker</h1>
        <p className="text-sm text-gray-500 m-0 mb-7 leading-relaxed">
          {mode === "login" && "Connectez-vous pour accéder à votre espace"}
          {mode === "signup" && "Créez votre compte"}
          {mode === "forgot" && "Réinitialisez votre mot de passe"}
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 rounded-xl px-4 py-3 text-[13px] mb-4 font-semibold text-left border-l-4 border-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-kurel-100 text-kurel-800 rounded-xl px-4 py-3 text-[13px] mb-4 font-semibold text-left border-l-4 border-kurel-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              className="block w-full border-2 border-gray-200 rounded-[14px] px-[18px] py-3.5 text-[15px] mb-3.5 font-sans outline-none box-border bg-gray-50 transition-colors focus:border-kurel-600"
              type="text"
              placeholder="Votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="block w-full border-2 border-gray-200 rounded-[14px] px-[18px] py-3.5 text-[15px] mb-3.5 font-sans outline-none box-border bg-gray-50 transition-colors focus:border-kurel-600"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode !== "forgot" && (
            <input
              className="block w-full border-2 border-gray-200 rounded-[14px] px-[18px] py-3.5 text-[15px] mb-3.5 font-sans outline-none box-border bg-gray-50 transition-colors focus:border-kurel-600"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          )}
          <button
            className="w-full bg-gradient-to-br from-kurel-600 to-kurel-700 text-white border-none rounded-[14px] py-4 text-base font-bold cursor-pointer font-sans mt-2 shadow-[0_4px_16px_rgba(22,163,74,0.3)] transition-all duration-150 hover:scale-[1.01] disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : mode === "signup"
              ? "Créer un compte"
              : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-gray-200 pt-5">
          {mode === "login" && (
            <>
              <button
                className="bg-transparent border-none text-kurel-600 text-sm cursor-pointer font-sans font-semibold transition-colors hover:text-kurel-800"
                onClick={() => switchMode("signup")}
              >
                Pas de compte ? Inscrivez-vous
              </button>
              <button
                className="bg-transparent border-none text-kurel-600 text-sm cursor-pointer font-sans font-semibold transition-colors hover:text-kurel-800"
                onClick={() => switchMode("forgot")}
              >
                Mot de passe oublié ?
              </button>
            </>
          )}
          {mode !== "login" && (
            <button
              className="bg-transparent border-none text-kurel-600 text-sm cursor-pointer font-sans font-semibold transition-colors hover:text-kurel-800"
              onClick={() => switchMode("login")}
            >
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
