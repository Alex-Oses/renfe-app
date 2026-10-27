/** Feeds de Renfe con datos publicados: AVE/Larga Distancia y Cercanías. */
export const FEEDS = ['avld', 'cercanias'] as const;
export type Feed = (typeof FEEDS)[number];
