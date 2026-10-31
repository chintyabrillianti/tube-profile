import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicProject } from "@/lib/api";
import ProjectDirectory from "./project-directory";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));

function project(
  id: number,
  options: Partial<PublicProject> = {},
): PublicProject {
  return {
    id,
    title: `Project ${String.fromCharCode(64 + id)}`,
    slug: `project-${id}`,
    work_type: id % 2 ? "dry_pigging" : "ect",
    description: `Maintenance work ${id}`,
    start_month: 1,
    start_year: 2024 + id,
    end_month: 3,
    end_year: 2024 + id,
    image_url: `https://example.test/${id}.jpg`,
    is_published: true,
    ...options,
  };
}

describe("ProjectDirectory", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("searches title and description, combines filters, and clears them", async () => {
    render(
      <ProjectDirectory
        projects={[
          project(1, { title: "Alpha Facility", description: "Client: North Plant" }),
          project(2, { title: "Beta Works", description: "Eddy current inspection" }),
          project(3, { title: "Gamma Site", work_type: "ect", description: "Client: North Plant" }),
        ]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Cari proyek"), {
      target: { value: "north plant" },
    });
    await waitFor(() => expect(screen.getByText("Menampilkan 2 proyek")).toBeTruthy());
    expect(screen.getByRole("heading", { name: "Alpha Facility" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Gamma Site" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Layanan"), {
      target: { value: "ect" },
    });
    expect(screen.getByText("Menampilkan 1 proyek")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Gamma Site" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Hapus filter" }));
    await waitFor(() => expect(screen.getByText("Menampilkan 3 proyek")).toBeTruthy());
    expect(screen.getByLabelText("Cari proyek")).toHaveProperty("value", "");
  });

  it("sorts by completion, start, and name using numeric periods", () => {
    render(
      <ProjectDirectory
        projects={[
          project(1, { title: "Zeta", start_month: 10, start_year: 2020, end_month: 2, end_year: 2022 }),
          project(2, { title: "Alpha", start_month: 1, start_year: 2021, end_month: 12, end_year: 2021 }),
          project(3, { title: "Middle", start_month: 2, start_year: 2019, end_month: 6, end_year: 2023 }),
        ]}
      />,
    );
    const cards = () =>
      screen.getAllByRole("article").map((card) => card.querySelector("h3")?.textContent);

    expect(cards()).toEqual(["Middle", "Zeta", "Alpha"]);
    fireEvent.change(screen.getByLabelText("Urutkan"), {
      target: { value: "oldest" },
    });
    expect(cards()).toEqual(["Alpha", "Zeta", "Middle"]);
    fireEvent.change(screen.getByLabelText("Urutkan"), {
      target: { value: "recently-started" },
    });
    expect(cards()).toEqual(["Alpha", "Zeta", "Middle"]);
    fireEvent.change(screen.getByLabelText("Urutkan"), {
      target: { value: "name" },
    });
    expect(cards()).toEqual(["Alpha", "Middle", "Zeta"]);
  });

  it.each([0, 1, 2, 10, 11, 20, 21, 35])(
    "displays no more than ten projects by default for %i projects",
    (count) => {
      const projects = Array.from({ length: count }, (_, index) =>
        project(index + 1, {
          title: `Project ${String(index + 1).padStart(2, "0")}`,
        }),
      );
      render(<ProjectDirectory projects={projects} />);

      expect(screen.queryAllByRole("article")).toHaveLength(Math.min(count, 10));
      expect(screen.queryByRole("navigation", { name: "Halaman proyek" }) !== null)
        .toBe(count > 10);
      expect(screen.queryByLabelText("Jumlah per halaman") !== null).toBe(count >= 20);
    },
  );

  it("paginates without duplicates, supports page sizes, and disables boundary arrows", () => {
    const projects = Array.from({ length: 35 }, (_, index) =>
      project(index + 1, {
        title: `Project ${String(index + 1).padStart(2, "0")}`,
      }),
    );
    render(<ProjectDirectory projects={projects} />);
    fireEvent.change(screen.getByLabelText("Urutkan"), {
      target: { value: "name" },
    });

    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByRole("button", { name: "Halaman sebelumnya" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.getByText("1 / 4")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Halaman berikutnya" }));
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByText("2 / 4")).toBeTruthy();
    expect(screen.getAllByRole("article").map((card) => card.querySelector("h3")?.textContent))
      .toEqual(Array.from({ length: 10 }, (_, index) => `Project ${String(index + 11).padStart(2, "0")}`));

    fireEvent.change(screen.getByLabelText("Jumlah per halaman"), {
      target: { value: "20" },
    });
    expect(screen.getAllByRole("article")).toHaveLength(20);
    expect(screen.getByText("1 / 2")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Jumlah per halaman"), {
      target: { value: "30" },
    });
    expect(screen.getAllByRole("article")).toHaveLength(30);
    expect(screen.getByText("1 / 2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Halaman berikutnya" }));
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getByText("2 / 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Halaman berikutnya" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("resets to the first page after search and service filters change", async () => {
    const projects = Array.from({ length: 25 }, (_, index) =>
      project(index + 1, {
        title: `Project ${String(index + 1).padStart(2, "0")}`,
        description: index === 0 ? "Unique client facility" : "Routine inspection",
      }),
    );
    render(<ProjectDirectory projects={projects} />);

    fireEvent.click(screen.getByRole("button", { name: "Halaman berikutnya" }));
    expect(screen.getByText("2 / 3")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Layanan"), {
      target: { value: "dry_pigging" },
    });
    expect(screen.getByText("1 / 2")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(10);

    fireEvent.click(screen.getByRole("button", { name: "Halaman berikutnya" }));
    fireEvent.change(screen.getByLabelText("Cari proyek"), {
      target: { value: "Unique client" },
    });
    await waitFor(() => {
      expect(screen.getByText("Menampilkan 1 proyek")).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: "Project 01" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Halaman proyek" })).toBeNull();
  });

  it("shows a friendly empty result state", async () => {
    render(<ProjectDirectory projects={[project(1)]} />);
    fireEvent.change(screen.getByLabelText("Cari proyek"), {
      target: { value: "not found" },
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Belum ada proyek yang sesuai dengan pencarian Anda. Coba kata kunci lain atau hapus filter.",
        ),
      ).toBeTruthy();
    });
  });
});
