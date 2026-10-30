-- Cancelar libera la butaca (asientos.reserva_id = null), asi que otra reserva puede volver a venderla:
-- el billete anulado conserva su asiento_id como historial y ya no puede ser unico.
alter table public.billetes drop constraint billetes_asiento_key;
