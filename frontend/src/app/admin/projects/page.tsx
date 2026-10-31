import ProjectsManager from "./projects-manager";
import AdminWorkspace from "../admin-workspace";

export default function AdminProjectsPage() {
  return (
    <AdminWorkspace>
      <ProjectsManager />
    </AdminWorkspace>
  );
}
