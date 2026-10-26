import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "./admin-dashboard";

const mocks = vi.hoisted(() => ({
  getCompanyProfile: vi.fn(),
  getProjects: vi.fn(),
}));

vi.mock("@/lib/admin-company-profile", () => ({
  getAdminCompanyProfile: mocks.getCompanyProfile,
}));

vi.mock("@/lib/admin-projects", () => ({
  getAdminProjects: mocks.getProjects,
}));

describe("AdminDashboard", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCompanyProfile.mockResolvedValue({
      legal_name: "Company Legal Name",
      display_name: "Company Display Name",
    });
    mocks.getProjects.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  });

  it("shows only dashboard data returned by the existing admin APIs", async () => {
    render(<AdminDashboard />);

    expect(await screen.findByText("Company Display Name")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Kelola profil perusahaan/ }).getAttribute("href"))
      .toBe("/admin/company-profile");
    expect(screen.getByRole("link", { name: /Kelola proyek/ }).getAttribute("href"))
      .toBe("/admin/projects");
    expect(screen.getByText("Belum ada sumber aktivitas terbaru yang tersedia."))
      .toBeTruthy();
  });
});
