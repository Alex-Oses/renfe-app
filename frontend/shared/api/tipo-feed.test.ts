import { describe, expect, it } from "vitest";
import { tipoDeFeed } from "./cliente";

describe("tipoDeFeed", () => {
  it("Cercanías por el feed, sin mirar el nombre", () => expect(tipoDeFeed("cercanias", "AVE 1")).toBe("Cercanías"));
  it("saca el producto del nombre", () => {
    expect(tipoDeFeed("avld", "AVE 02070")).toBe("AVE");
    expect(tipoDeFeed("avld", "Avlo 6000")).toBe("Avlo");
    expect(tipoDeFeed("avld", "MD 18000")).toBe("Media Distancia");
  });
  it("sin nombre es Larga Distancia", () => expect(tipoDeFeed("avld", null)).toBe("Larga Distancia"));
});
