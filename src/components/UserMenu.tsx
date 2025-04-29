import { useState, useEffect } from "react";
import { signOut } from "../lib/services/auth";
import { toast } from "sonner";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ustawienie początkowego trybu na podstawie klasy dokumentu
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Wylogowano pomyślnie");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Błąd podczas wylogowywania");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 text-zinc-300 hover:text-white transition"
      >
        <span className="font-medium">Konto</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg overflow-hidden z-10">
          <div className="py-2">
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              Profil
            </a>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              <span>Tryb {isDarkMode ? 'jasny' : 'ciemny'}</span>
              <span className="flex items-center justify-center w-8 h-5 rounded-full bg-zinc-700 p-0.5">
                <span 
                  className={`block w-4 h-4 rounded-full transform transition-transform ${
                    isDarkMode ? 'translate-x-3 bg-blue-500' : 'translate-x-0 bg-zinc-300'
                  }`}
                />
              </span>
            </button>
            <div className="border-t border-zinc-800 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
