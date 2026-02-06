import Sidebar from "../../components/Sidebar";
import RoleGuard from "../../components/RoleGuard";

export default async function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <RoleGuard requiredRole="vendedor" />
        <Sidebar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
