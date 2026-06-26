"use client";

import { useEffect, useState } from "react";
import { isMockMode } from "@/services/runtime";

export function MockProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [ready, setReady] = useState(!isMockMode());

  useEffect(() => {
    if (!isMockMode()) return;

    void import("@/mocks/browser").then(async ({ worker }) => {
      await worker.start({ onUnhandledRequest: "bypass" });
      setReady(true);
    });
  }, []);

  return ready ? children : null;
}
