import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabaseClient } from "../db/supabase.client";
import { useUser } from "../lib/hooks/useUser";

const UserMenu = () => {
  const { user, isLoading } = useUser();

  const userInitial = user?.email?.[0]?.toUpperCase() || "";

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw error;
      }

      toast.success("Wylogowano pomyślnie");
      window.location.href = "/";
    } catch (error) {
      toast.error("Wystąpił błąd podczas wylogowywania");
      console.error("Błąd wylogowania:", error);
    }
  };

  if (isLoading || !user) {
    return <div className="w-9 h-9 rounded-full bg-blue-600/30 animate-pulse"></div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium cursor-pointer hover:bg-blue-700 transition-colors">
          {userInitial}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-700">{user?.email || "Użytkownik"}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <a href="/profile">Profil</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
          Wyloguj się
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
