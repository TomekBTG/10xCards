import React from "react";
import type { User } from "@supabase/supabase-js";

interface UserProfileDetailsProps {
  user: User;
}

/**
 * Component that displays user profile information
 */
const UserProfileDetails: React.FC<UserProfileDetailsProps> = ({ user }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{user.email}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">ID użytkownika</p>
          <p className="text-base break-all">{user.id}</p>
        </div>

        {user.user_metadata?.name && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Imię</p>
            <p className="text-base">{user.user_metadata.name}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground">Status potwierdzenia email</p>
          <p className="text-base">
            {user.email_confirmed_at
              ? `Potwierdzony (${new Date(user.email_confirmed_at).toLocaleDateString()})`
              : "Niepotwierdzony"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Ostatnie logowanie</p>
          <p className="text-base">
            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Brak danych"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
