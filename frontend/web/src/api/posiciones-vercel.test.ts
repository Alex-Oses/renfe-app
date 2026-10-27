import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/posiciones";

const feed = (tripId: string) => ({
  header: { timestamp: 1793100000 },
  entity: [{ vehicle: { trip: { tripId }, position: { latitude: 40, longitude: -3, speed: 10 }, vehicle: { id: "1" } } }],
});

// Imita el res de Node que Vercel pasa al handler.
async function llamar() {
  const cabeceras: Record<string, string> = {};
  const res = { statusCode: 0, cuerpo: "", setHeader: (n: string, v: string) => void (cabeceras[n] = v), end(c: string) { this.cuerpo = c; } };
  await handler({}, res);
  return { estado: res.statusCode, cabeceras, json: JSON.parse(res.cuerpo) };
}

afterEach(() => vi.unstubAllGlobals());

describe("función de Vercel /api/posiciones", () => {
  it("junta los dos feeds de Renfe con la forma del contrato y caché de 30 s", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(feed(url.includes("_LD") ? "ld" : "cer"))));
    const r = await llamar();
    expect(r.estado).toBe(200);
    expect(r.cabeceras["Cache-Control"]).toContain("s-maxage=30");
    expect(r.json.datos.map((p: { feed: string }) => p.feed).sort()).toEqual(["avld", "cercanias"]);
  });

  it("si un feed falla sirve el otro; si fallan los dos responde 503 con el motivo", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("_LD") ? new Response("", { status: 500 }) : Response.json(feed("cer")))));
    expect((await llamar()).json.datos).toHaveLength(1);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    const r = await llamar();
    expect(r.estado).toBe(503);
    expect(r.json.motivos[0]).toContain("500");
  });
});
