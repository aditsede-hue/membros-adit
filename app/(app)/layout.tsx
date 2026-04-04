import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <div
        style={{ marginLeft: "var(--sidebar-w)" }}
        className="flex-1 flex flex-col min-h-full"
      >
        {children}
      </div>
    </div>
  );
}
