import AdminDashboard from "./admin-dashboard";
import AdminWorkspace from "./admin-workspace";

export default function AdminPage() {
  return (
    <AdminWorkspace>
      <AdminDashboard />
    </AdminWorkspace>
  );
}
