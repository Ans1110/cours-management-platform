import { useEffect, useCallback, useRef } from "react";
import { Clock, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/api/auth";

const WARNING_THRESHOLD_MS = 2 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

export function SessionExpiryModal() {
  const {
    expiresAt,
    showExpiryModal,
    isExtending,
    setShowExpiryModal,
    setExpiresAt,
    setIsExtending,
    clearSession,
  } = useSessionStore();

  const { isAuthenticated, logout } = useAuthStore();
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleLogout = useCallback(async () => {
    clearSession();
    await logout();
    window.location.href = "/login";
  }, [clearSession, logout]);

  const handleExtendSession = useCallback(async () => {
    setIsExtending(true);
    try {
      await authApi.refresh("");
      const newExpiresAt = Date.now() + 15 * 60 * 1000;
      setExpiresAt(newExpiresAt);
      setShowExpiryModal(false);
    } catch {
      await handleLogout();
    } finally {
      setIsExtending(false);
    }
  }, [setIsExtending, setExpiresAt, setShowExpiryModal, handleLogout]);

  const checkExpiry = useCallback(() => {
    if (!expiresAt || !isAuthenticated) return;

    const timeUntilExpiry = expiresAt - Date.now();

    if (timeUntilExpiry <= 0) {
      handleLogout();
    } else if (timeUntilExpiry <= WARNING_THRESHOLD_MS && !showExpiryModal) {
      setShowExpiryModal(true);
    }
  }, [
    expiresAt,
    isAuthenticated,
    showExpiryModal,
    setShowExpiryModal,
    handleLogout,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    checkExpiry();
    checkIntervalRef.current = setInterval(checkExpiry, CHECK_INTERVAL_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkExpiry]);

  const getRemainingTime = () => {
    if (!expiresAt) return "";
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={showExpiryModal} onOpenChange={setShowExpiryModal}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your session will expire in{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {getRemainingTime()}
            </span>
            . Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Log Out
          </Button>
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
            className="w-full sm:w-auto"
          >
            {isExtending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Extend Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionExpiryModal;
