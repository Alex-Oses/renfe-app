// Texto para comparar y para URLs: sin tildes y en minúsculas ("Málaga" -> "malaga").
export const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Slug para buscar fotos y rutas ("A Coruña" -> "a-coruna").
export const slug = (s: string) =>
  sinTildes(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
