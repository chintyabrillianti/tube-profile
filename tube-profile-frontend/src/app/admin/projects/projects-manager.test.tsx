import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProjectsManager from "./projects-manager";
import type { Project } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  deleteProject: vi.fn(),
  getProjects: vi.fn(),
  replace: vi.fn(),
  saveProject: vi.fn(),
  router: {} as { replace: () => void },
}));
mocks.router.replace = mocks.replace;

vi.mock("@/lib/admin-projects", () => ({
  deleteAdminProject: mocks.deleteProject,
  getAdminProjects: mocks.getProjects,
  saveAdminProject: mocks.saveProject,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src: string }) => (
    <div aria-label={alt} data-src={src} role="img" />
  ),
}));

const savedProject: Project = {
  id: 11,
  title: "Project title",
  slug: "project-title",
  work_type: "dry_pigging",
  description: null,
  start_month: 1,
  start_year: 2026,
  end_month: 3,
  end_year: 2026,
  image_url: "http://localhost/storage/projects/project.jpg",
  is_published: true,
};

describe("ProjectsManager", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProjects.mockResolvedValue([]);
    mocks.saveProject.mockResolvedValue(savedProject);
    mocks.deleteProject.mockResolvedValue(undefined);
  });

  it("creates a project with month-based dates and an image", async () => {
    render(<ProjectsManager />);
    await screen.findByText(/Belum ada proyek/);

    fireEvent.change(screen.getByLabelText("Nama proyek"), {
      target: { value: "Project title" },
    });
    fireEvent.change(screen.getByLabelText("Jenis pekerjaan"), {
      target: { value: "dry_pigging" },
    });
    fireEvent.change(screen.getByLabelText("Bulan mulai"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Tahun mulai"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText("Bulan selesai"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Tahun selesai"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText(/Gambar proyek/), {
      target: {
        files: [new File(["image"], "project.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.click(screen.getByLabelText("Tampilkan proyek pada situs web publik"));
    expect(screen.getByLabelText("Jenis pekerjaan")).toHaveProperty(
      "value",
      "dry_pigging",
    );
    expect(screen.getByLabelText("Bulan mulai")).toHaveProperty("value", "1");
    expect(screen.getByLabelText("Bulan selesai")).toHaveProperty("value", "3");
    expect(
      screen.getByLabelText("Tampilkan proyek pada situs web publik"),
    ).toHaveProperty("checked", true);
    fireEvent.submit(
      screen.getByRole("button", { name: "Tambah proyek" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.saveProject).toHaveBeenCalledWith(
        {
          title: "Project title",
          work_type: "dry_pigging",
          description: "",
          start_month: 1,
          start_year: 2026,
          end_month: 3,
          end_year: 2026,
          is_published: true,
        },
        expect.any(File),
        undefined,
      );
    });
    expect(await screen.findByText("Project title")).toBeTruthy();
    expect(screen.getByText(/Januari 2026 – Maret 2026/)).toBeTruthy();
  });

  it("shows month-specific validation when untouched month selectors are blank", async () => {
    render(<ProjectsManager />);
    await screen.findByText(/Belum ada proyek/);

    fireEvent.change(screen.getByLabelText("Nama proyek"), {
      target: { value: "Project title" },
    });
    fireEvent.change(screen.getByLabelText("Jenis pekerjaan"), {
      target: { value: "dry_pigging" },
    });
    fireEvent.change(screen.getByLabelText("Tahun mulai"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText("Tahun selesai"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText(/Gambar proyek/), {
      target: {
        files: [new File(["image"], "project.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Tambah proyek" }).closest("form")!,
    );

    expect(await screen.findByText("Pilih bulan mulai.")).toBeTruthy();
    expect(screen.getByText("Pilih bulan selesai.")).toBeTruthy();
    expect(mocks.saveProject).not.toHaveBeenCalled();
  });
});
