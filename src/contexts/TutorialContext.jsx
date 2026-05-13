import { createContext, useContext, useState } from "react";
import { useAuthContext } from "./AuthContext";

const TutorialContext = createContext(null);

export function TutorialProvider({ children }) {
  const { user } = useAuthContext();
  const key = user?.id ? `kurel_tutorial_${user.id}` : null;

  const [show, setShow] = useState(() => {
    if (!key) return false;
    return !localStorage.getItem(key);
  });

  const close = () => {
    if (key) localStorage.setItem(key, "1");
    setShow(false);
  };

  const replay = () => setShow(true);

  return (
    <TutorialContext.Provider value={{ show, close, replay }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}
