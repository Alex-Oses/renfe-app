-- Modelo concreto de la huella facial (ADR-007, pendiente «elegir el fichero ONNX»):
-- w600k_mbf, el ArcFace de 512 dimensiones para móvil del paquete buffalo_s de InsightFace.
-- El de referencia (buffalo_l, ResNet50) pesa ~170 MB y no cabe en el navegador.
-- Cambiar el modelo invalida las plantillas guardadas: verificar devuelve `modelo_distinto`
-- y el usuario tiene que volver a registrar la cara (lo dice el ADR).
update config_cara set modelo = 'arcface/w600k_mbf';
