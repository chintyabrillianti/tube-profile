import { afterEach, describe, expect, it, vi } from "vitest";
import { saveAdminProject } from "./admin-projects";
import type { Project } from "./api";

vi.mock("@/lib/admin-auth", () => ({
  prepareCsrf: vi.fn().mockResolvedValue("csrf-token"),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const project: Project = {
  id: 5,
  title: "Industrial tube work",
  slug: "industrial-tube-work",
  work_type: "ect",
  description: "Tube inspection.",
  start_month: 1,
  start_year: 2026,
  end_month: 3,
  end_year: 2026,
  image_url: "http://localhost/storage/projects/project.png",
  is_published: true,
};

describe("saveAdminProject request", () => {
  it("sends matching multipart field names and numeric month/year values", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: project }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const image = new File(["image-data"], "project.png", { type: "image/png" });

    await saveAdminProject(
      {
        title: "Industrial tube work",
        work_type: "ect",
        description: "Tube inspection.",
        start_month: 1,
        start_year: 2026,
        end_month: 3,
        end_year: 2026,
        is_published: true,
      },
      image,
    );

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/admin/projects");
    expect(request.method).toBe("POST");
    expect(request.headers).toMatchObject({
      Accept: "application/json",
      "X-XSRF-TOKEN": "csrf-token",
    });
    expect(request.headers).not.toHaveProperty("Content-Type");
    expect(request.body).toBeInstanceOf(FormData);
    const body = request.body as FormData;
    expect(Array.from(body.keys()).sort()).toEqual([
      "description",
      "end_month",
      "end_year",
      "image",
      "is_published",
      "start_month",
      "start_year",
      "title",
      "work_type",
    ]);
    expect(body.get("start_month")).toBe("1");
    expect(body.get("start_year")).toBe("2026");
    expect(body.get("end_month")).toBe("3");
    expect(body.get("end_year")).toBe("2026");
    expect(body.get("work_type")).toBe("ect");
    expect(body.get("image")).toBe(image);
  });

  it("localizes standard Laravel field validation messages for the admin form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            errors: {
              title: ["The title field is required."],
              start_year: ["The start year must be between 1900 and 2200."],
            },
          }),
          { status: 422, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(
      saveAdminProject(
        {
          title: "",
          work_type: "ect",
          description: null,
          start_month: 1,
          start_year: 2026,
          end_month: 3,
          end_year: 2026,
          is_published: false,
        },
        null,
      ),
    ).rejects.toMatchObject({
      message: "Nama proyek wajib diisi.",
      fieldErrors: {
        title: ["Nama proyek wajib diisi."],
        start_year: ["Tahun mulai harus berupa tahun antara 1900 dan 2200."],
      },
    });
  });
});
