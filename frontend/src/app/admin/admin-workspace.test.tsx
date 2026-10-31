import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminWorkspace from "./admin-workspace";

const mocks = vi.hoisted(() => ({
  getCurrentAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  replace: vi.fn(),
  pathname: "/admin",
}));

vi.mock("@/lib/admin-auth", () => ({
  getCurrentAdmin: mocks.getCurrentAdmin,
  logoutAdmin: mocks.logoutAdmin,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

describe("AdminWorkspace", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/admin";
    mocks.getCurrentAdmin.mockResolvedValue({
      id: 1,
      name: "Admin BENE",
      email: "admin@example.test",
    });
    mocks.logoutAdmin.mockResolvedValue(undefined);
  });

  it("shows the authenticated identity and the active navigation item", async () => {
    render(
      <AdminWorkspace>
        <p>Isi halaman</p>
      </AdminWorkspace>,
    );

    expect(await screen.findByText("Admin BENE")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current"))
      .toBe("page");
    expect(screen.getByText("Isi halaman")).toBeTruthy();
  });

  it("opens the mobile navigation drawer and closes it with Escape", async () => {
    render(
      <AdminWorkspace>
        <p>Isi halaman</p>
      </AdminWorkspace>,
    );
    await screen.findByText("Admin BENE");

    const menuButton = screen.getByRole("button", {
      name: "Buka menu navigasi",
    });
    fireEvent.click(menuButton);

    expect(screen.getByRole("dialog", { name: "Menu admin" })).toBeTruthy();
    expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Menu admin" })).toBeNull();
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("logs out through the existing authentication API", async () => {
    render(
      <AdminWorkspace>
        <p>Isi halaman</p>
      </AdminWorkspace>,
    );
    await screen.findByText("Admin BENE");
    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));

    await waitFor(() => {
      expect(mocks.logoutAdmin).toHaveBeenCalledOnce();
      expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
    });
  });
});
