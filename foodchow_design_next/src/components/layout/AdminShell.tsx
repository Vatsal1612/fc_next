"use client";

import { useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/utils";
import styles from "./shell.module.css";

/**
 * Admin shell wrapper. Renders the fixed header and the dual sidebar, with route
 * content placed in the main region (the original used an <iframe>; here it is the
 * Next.js route children). The hamburger collapses the sidebars.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className={styles.appContainer}>
        {!collapsed && <Sidebar />}
        <main className={cn(styles.appFrame)}>{children}</main>
      </div>
    </>
  );
}
