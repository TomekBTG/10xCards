import React, { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  pageTitle: string;
  alternateLink: string;
  alternateLinkText: string;
}

export function AuthLayout({ children, pageTitle, alternateLink, alternateLinkText }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-zinc-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{pageTitle}</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 px-4 py-8 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-zinc-700">
          {children}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <a href={alternateLink} className="font-medium text-primary hover:text-primary/80">
              {alternateLinkText}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} 10xCards. Wszystkie prawa zastrzeżone.</p>
      </div>
    </div>
  );
}
