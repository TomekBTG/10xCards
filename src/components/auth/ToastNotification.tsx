import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function ToastNotification({ type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200";
      case "error":
        return "bg-red-50 text-red-800 border-red-200";
      case "info":
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className={cn("fixed top-4 right-4 z-50 max-w-md rounded-md border p-4 shadow-md", getStyles())} role="alert">
      <div className="flex items-start">
        <div
          className={cn(
            "flex-shrink-0",
            type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-blue-500"
          )}
        >
          {getIcon()}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-md p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500"
          onClick={onClose}
        >
          <span className="sr-only">Zamknij</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
