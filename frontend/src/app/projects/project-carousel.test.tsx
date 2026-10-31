import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicProject } from "@/lib/api";
import ProjectCarousel from "./project-carousel";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

function project(id: number): PublicProject {
  return {
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    work_type: id % 2 ? "dry_pigging" : "ect",
    description: `Work description ${id}`,
    start_month: 1,
    start_year: 2025,
    end_month: 2,
    end_year: 2025,
    image_url: `https://example.test/${id}.jpg`,
    is_published: true,
  };
}

function setViewport(width: number, reducedMotion = false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("max-width")
        ? width <= 639
        : reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("ProjectCarousel", () => {
  beforeEach(() => {
    setViewport(1280);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders empty, one, and two projects without useless controls", () => {
    const { rerender } = render(<ProjectCarousel projects={[]} />);
    expect(screen.getByText("Belum ada proyek yang ditampilkan.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Proyek berikutnya" })).toBeNull();

    rerender(<ProjectCarousel projects={[project(1)]} />);
    expect(screen.getByRole("heading", { name: "Project 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Proyek berikutnya" })).toBeNull();

    rerender(<ProjectCarousel projects={[project(1), project(2)]} />);
    expect(screen.getByRole("heading", { name: "Project 1" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Project 2" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Proyek berikutnya" })).toBeNull();
  });

  it("shows two cards per desktop slide and wraps the arrow controls", () => {
    render(
      <ProjectCarousel projects={[project(1), project(2), project(3), project(4), project(5)]} />,
    );

    expect(screen.getByText("1 / 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Proyek berikutnya" }));
    expect(screen.getByText("2 / 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Proyek sebelumnya" }));
    expect(screen.getByText("1 / 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Proyek sebelumnya" }));
    expect(screen.getByText("3 / 3")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat Semua Proyek" }).getAttribute("href"))
      .toBe("/projects");
  });

  it("keeps the active slide valid when the project list shrinks", () => {
    const { rerender } = render(
      <ProjectCarousel projects={[project(1), project(2), project(3), project(4), project(5), project(6)]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Proyek berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Proyek berikutnya" }));
    expect(screen.getByText("3 / 3")).toBeTruthy();

    rerender(<ProjectCarousel projects={[project(1), project(2), project(3)]} />);
    expect(screen.getByText("1 / 2")).toBeTruthy();
  });

  it.each([
    [320, 4],
    [390, 4],
    [768, 2],
    [1280, 2],
  ])("uses the expected number of cards at %i px", (width, expectedSlides) => {
    setViewport(width);
    render(
      <ProjectCarousel projects={[project(1), project(2), project(3), project(4)]} />,
    );
    expect(screen.getByText(`1 / ${expectedSlides}`)).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(width < 640 ? 1 : 2);
  });

  it("autoplays every six seconds, pauses on hover, and respects reduced motion", () => {
    vi.useFakeTimers();
    render(
      <ProjectCarousel projects={[project(1), project(2), project(3), project(4), project(5)]} />,
    );
    const carousel = screen
      .getByRole("button", { name: "Proyek berikutnya" })
      .closest("div.mt-10");
    expect(carousel).toBeTruthy();

    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByText("2 / 3")).toBeTruthy();
    fireEvent.mouseEnter(carousel!);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText("2 / 3")).toBeTruthy();
    fireEvent.mouseLeave(carousel!);
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByText("3 / 3")).toBeTruthy();

    fireEvent.focus(screen.getByRole("button", { name: "Proyek berikutnya" }));
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText("3 / 3")).toBeTruthy();
    fireEvent.blur(screen.getByRole("button", { name: "Proyek berikutnya" }), {
      relatedTarget: document.body,
    });

    cleanup();
    setViewport(1280, true);
    render(
      <ProjectCarousel projects={[project(1), project(2), project(3), project(4)]} />,
    );
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText("1 / 2")).toBeTruthy();
  });
});
