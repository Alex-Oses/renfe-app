-- Extras de la reserva (maleta, mascota, bici, menú, seguro). Simulados como el resto de precios:
-- la API los cobra y los suma a importe_centimos para que Mis billetes y el correo cuadren con lo pagado.
alter table public.reservas
  add column extras text[] not null default '{}',
  add column extras_centimos integer not null default 0
    constraint reservas_extras_check check (extras_centimos >= 0);

comment on column public.reservas.extras is 'Ids de los extras contratados; el precio va en extras_centimos.';
comment on column public.reservas.extras_centimos is 'Parte de importe_centimos que corresponde a los extras.';
