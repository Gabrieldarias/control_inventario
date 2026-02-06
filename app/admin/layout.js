import RoleGuard from "../../components/RoleGuard";

export default async function AdminLayout({ children }) {
  return (
    <div className="min-h-screen px-6 py-10">
      <RoleGuard requiredRole="admin" />
      {children}
    </div>
  );
}
