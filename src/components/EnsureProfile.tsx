import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { useEffect, useRef, type ReactNode } from "react";
import { api } from "../../convex/_generated/api";

export function EnsureProfile({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureProfile = useMutation(api.profiles.ensureMyProfile);
  const ranForSession = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      ranForSession.current = false;
      return;
    }
    if (ranForSession.current) {
      return;
    }
    ranForSession.current = true;
    void ensureProfile({});
  }, [isAuthenticated, isLoading, ensureProfile]);

  return <>{children}</>;
}
