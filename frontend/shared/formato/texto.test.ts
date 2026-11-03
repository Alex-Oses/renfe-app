import { describe, expect, it } from "vitest";
import { sinTildes, slug } from "./texto";

describe("texto", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(sinTildes("Málaga")).toBe("malaga");
    expect(sinTildes("A Coruña")).toBe("a coruna");
  });
  it("slug con guiones y sin bordes", () => {
    expect(slug("A Coruña")).toBe("a-coruna");
    expect(slug(" Lleida-Pirineus ")).toBe("lleida-pirineus");
    expect(slug("Alicante/Alacant")).toBe("alicante-alacant");
  });
});
