import React from "react";
import { useUser } from "../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Toaster } from "../components/ui/sonner";
import UserProfileDetails from "./UserProfileDetails";
import PasswordChangeForm from "./PasswordChangeForm";
import DeleteAccountSection from "./DeleteAccountSection";

/**
 * UserPanel component - manages the user profile page
 * Shows user details, password change form and account deletion option
 */
const UserPanel: React.FC = () => {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <p className="text-lg text-muted-foreground">Ładowanie danych użytkownika...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <p className="text-destructive font-medium">
          {error || "Nie znaleziono danych użytkownika. Proszę zalogować się ponownie."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Toaster />

      <Card>
        <CardHeader>
          <CardTitle>Dane użytkownika</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileDetails user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zmiana hasła</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usunięcie konta</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPanel;
