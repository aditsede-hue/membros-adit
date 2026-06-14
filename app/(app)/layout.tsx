"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { TemaProvider } from "@/lib/TemaProvider";
import { IgrejaProvider } from "@/lib/IgrejaProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? 64 : 240;

  return (
    <TemaProvider>
      <IgrejaProvider>
        <div className="h-full flex">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
          <div style={{
            marginLeft: sidebarW,
            transition: "margin-left 0.25s ease",
            flex: 1, display: "flex", flexDirection: "column", minHeight: "100%",
            background: "var(--surface-2)",
          }}>
            {children}
          </div>
        </div>
      </IgrejaProvider>
    </TemaProvider>
  );
}
