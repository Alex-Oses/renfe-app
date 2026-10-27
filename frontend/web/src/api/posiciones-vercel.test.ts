import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../api/posiciones";

const feed = (tripId: string) => ({
  header: { timestamp: 1793100000 },
  entity: [{ vehicle: { trip: { tripId }, position: { latitude: 40, longitude: -3, speed: 10 }, vehicle: { id: "1" } } }],
});

afterEach(() => vi.unstubAllGlobals());

describe("función de Vercel /api/posiciones", () => {
  it("junta los dos feeds de Renfe con la forma del contrato y caché de 30 s", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(feed(url.includes("_LD") ? "ld" : "cer"))));
    const r = await GET();
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toContain("s-maxage=30");
    const cuerpo = await r.json();
    expect(cuerpo.datos.map((p: { feed: string }) => p.feed).sort()).toEqual(["avld", "cercanias"]);
  });

  it("si un feed falla sirve el otro; si fallan los dos responde 503", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("_LD") ? new Response("", { status: 500 }) : Response.json(feed("cer")))));
    expect((await (await GET()).json()).datos).toHaveLength(1);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    expect((await GET()).status).toBe(503);
  });
});
