-- =============================================================================
-- 04 · Reservas, billetes y abonos
-- =============================================================================
-- Contrato:   obsidian/02-contratos-api/modelo-datos.md §5 (§5.1 a §5.6) y §7;
--             obsidian/02-contratos-api/endpoints.md:
--               «Formato del QR del billete», «POST /billetes/validar»
--               y «Abonos y bonos».
--
-- Depende de: 20261028120000_extensiones_y_funciones.sql (`set_actualizado_en()`),
--             20261028120100_identidad.sql (`perfiles`) y
--             20261028120200_catalogo_gtfs.sql (`viajes`, `estaciones`).
--
-- Qué NO entra aquí, a propósito:
--   `pagos` (§5.3): es Stripe en modo test y llega con el webhook (Kevin).
--   `posiciones_trenes` e `incidencias` (§6): son GTFS-RT y van en su migración.
--
-- Orden de creación = orden de las claves ajenas:
--   reservas → asientos → abonos → billetes → validaciones.
--
-- Todo lo de esta migración es historial: no se borra en duro, se cambia de
-- estado (§1, decisión 6). `service_role` escribe siempre; las políticas existen
-- para que la app no vea más de lo suyo (§7).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5.2 · reservas
-- -----------------------------------------------------------------------------
-- Una reserva = un viaje **de un día** y un trayecto. El estado `pendiente` es
-- la retención de butacas: 15 minutos para pagar (decisión 1 de §10.1). Si no se
-- paga, la API la pasa a `caducada` y libera las butacas.
--
-- `usuario_id` es nullable a propósito: al borrar una cuenta, `auth.users` →
-- `perfiles` se van en cascada y las reservas **no** se borran (son historial
-- contable, §8). La API las anonimiza dejando `usuario_id` a null; con un
-- `not null ... on delete restrict` la cuenta no se podría borrar nunca.
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid
    references public.perfiles (id) on delete set null,
  feed text not null
    constraint reservas_feed_check check (feed in ('cercanias', 'avld')),
  viaje_id text not null,
  fecha_servicio date not null,
  origen_id text not null
    references public.estaciones (id) on delete restrict,
  destino_id text not null
    references public.estaciones (id) on delete restrict,
  referencia text not null
    constraint reservas_referencia_key unique,
  estado text not null default 'pendiente'
    constraint reservas_estado_check
    check (estado in ('pendiente', 'pagada', 'cancelada', 'caducada')),
  importe_centimos integer not null
    constraint reservas_importe_check check (importe_centimos >= 0),
  creada_en timestamptz not null default now(),
  expira_en timestamptz not null default (now() + interval '15 minutes'),
  actualizado_en timestamptz not null default now(),
  constraint reservas_viaje_fkey
    foreign key (feed, viaje_id)
    references public.viajes (feed, id) on delete restrict,
  constraint reservas_trayecto_check check (origen_id <> destino_id),
  constraint reservas_expira_check check (expira_en > creada_en)
);

comment on table public.reservas is
  'Reserva de un trayecto en un viaje de un día. `pendiente` = retención de 15 min (decisión 1 de modelo-datos §10.1).';
comment on column public.reservas.usuario_id is
  'Nullable + on delete set null: al borrar la cuenta la API anonimiza y el historial se queda (§8).';
comment on column public.reservas.origen_id is
  'Estación de subida. Sin esta columna el billete no se puede limitar al trayecto vendido: el viaje puede seguir más allá del destino.';
comment on column public.reservas.destino_id is
  'Estación de bajada. Distinta de origen_id (lo valida reservas_trayecto_check).';
comment on column public.reservas.referencia is
  'Código corto legible, `localizador` en la API (endpoints.md, formato del QR: clave `loc`). Hoy con prefijo `R-` (p. ej. R-7K3M9Q).';
comment on column public.reservas.estado is
  'pendiente | pagada | cancelada | caducada. `anulado` en POST /billetes/validar cubre cancelada y el reembolso de pagos.estado.';
comment on column public.reservas.importe_centimos is
  'Precio simulado de la reserva completa, en céntimos (sin floats). No se guarda por asiento (§5.1).';
comment on column public.reservas.expira_en is
  'Fin de la retención: creada_en + 15 min. Índice parcial para el barrido de caducadas.';

-- «Mis viajes» y la lista de reservas del usuario.
create index reservas_usuario_fecha_idx
  on public.reservas (usuario_id, fecha_servicio);
create index reservas_usuario_creada_idx
  on public.reservas (usuario_id, creada_en desc);
-- Barrido de retenciones caducadas (solo mira las pendientes).
create index reservas_expira_pendiente_idx
  on public.reservas (expira_en) where estado = 'pendiente';
-- `on delete restrict` de `viajes`: la purga del catálogo comprueba por aquí.
create index reservas_feed_viaje_idx
  on public.reservas (feed, viaje_id);

create trigger reservas_actualizado_en
  before update on public.reservas
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 5.1 · asientos (simulado)
-- -----------------------------------------------------------------------------
-- Butacas por **viaje y fecha**: el mismo `viaje_id` de AV/LD/MD circula varios
-- días, y sin `fecha_servicio` en la clave reservar la 12 bloquearía el rango
-- entero (decisión 9 de §10.1).
--
-- La ocupación va en `reserva_id`, no en un `estado`: nulo = libre. La API
-- asigna con `update ... where id = $1 and reserva_id is null returning *`, que
-- resuelve la carrera sin bloqueos explícitos (§5.1). Al cancelar o caducar una
-- reserva, la API pone `reserva_id = null` en la misma transacción.
--
-- Las butacas se generan bajo demanda desde la API (plantilla según
-- `rutas.tipo_servicio`): no se materializan por feed (§1, decisión 8).
create table public.asientos (
  id uuid primary key default gen_random_uuid(),
  feed text not null
    constraint asientos_feed_check check (feed in ('cercanias', 'avld')),
  viaje_id text not null,
  fecha_servicio date not null,
  coche smallint not null
    constraint asientos_coche_check check (coche between 1 and 20),
  numero smallint not null
    constraint asientos_numero_check check (numero between 1 and 200),
  clase text not null
    constraint asientos_clase_check check (clase in ('turista', 'preferente')),
  ventanilla boolean not null default false,
  reserva_id uuid
    references public.reservas (id) on delete set null,
  constraint asientos_viaje_fkey
    foreign key (feed, viaje_id)
    references public.viajes (feed, id) on delete cascade,
  constraint asientos_butaca_key unique (feed, viaje_id, fecha_servicio, coche, numero)
);

comment on table public.asientos is
  'Butaca simulada de un viaje **y una fecha**. reserva_id null = libre; la ocupación es la única fuente de verdad.';
comment on column public.asientos.fecha_servicio is
  'La butaca es del viaje de ese día: el mismo viaje_id se vende varios días (decisión 9 de §10.1).';
comment on column public.asientos.clase is
  'turista | preferente. La API la presenta capitalizada (la web y el QR hablan de «Turista»/«Confort»).';
comment on column public.asientos.ventanilla is
  'Solo para la UI del mapa de butacas; no lo publica Renfe.';

-- Butacas libres para `plazasLibres` de `GET /trenes`.
create index asientos_libres_idx
  on public.asientos (feed, viaje_id, fecha_servicio) where reserva_id is null;
-- Liberar butacas al cancelar o caducar una reserva.
create index asientos_reserva_idx on public.asientos (reserva_id);

-- -----------------------------------------------------------------------------
-- 5.6 · abonos y bonos
-- -----------------------------------------------------------------------------
-- Nuevo en el contrato (endpoints.md, 2026-10-28: «Abonos y bonos»). Productos
-- **simulados**, como los billetes, con los cuatro tipos cerrados del contrato:
--
--   ave-ld-mensual       Abono mensual AVE/LD   30 días, ilimitado, con trayecto
--   avant-mensual        Abono mensual Avant     30 días, ilimitado, con trayecto
--   cercanias-recurrente Abono recurrente Cercanías 30 días, ilimitado, SIN trayecto
--   bono-10              Bono 10 viajes          60 días, 10 viajes, con trayecto
--
-- `id` es el uuid interno (principio 1 de §1) y `referencia` el id público que
-- devuelve la API (`AB-7K2M9Q`, el que viaja en `GET /abonos/:id` y en el QR).
-- `fin` es el último día válido **inclusive**; lo calcula la API junto con el
-- precio y los viajes (endpoints.md, POST /abonos).
create table public.abonos (
  id uuid primary key default gen_random_uuid(),
  referencia text not null
    constraint abonos_referencia_key unique,
  usuario_id uuid
    references public.perfiles (id) on delete set null,
  tipo text not null
    constraint abonos_tipo_check check (tipo in (
      'ave-ld-mensual', 'avant-mensual', 'cercanias-recurrente', 'bono-10'
    )),
  nombre text not null
    constraint abonos_nombre_check check (length(btrim(nombre)) between 1 and 80),
  origen_id text
    references public.estaciones (id) on delete restrict,
  destino_id text
    references public.estaciones (id) on delete restrict,
  inicio date not null,
  fin date not null,
  viajes_totales smallint
    constraint abonos_viajes_totales_check check (viajes_totales > 0),
  viajes_restantes smallint
    constraint abonos_viajes_restantes_check check (viajes_restantes >= 0),
  precio_centimos integer not null
    constraint abonos_precio_check check (precio_centimos >= 0),
  estado text not null default 'pendiente'
    constraint abonos_estado_check
    check (estado in ('pendiente', 'activo', 'anulado', 'caducado')),
  qr text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint abonos_fechas_check check (fin >= inicio),
  constraint abonos_trayecto_check check (
    case
      when tipo = 'cercanias-recurrente'
        then origen_id is null and destino_id is null
      else origen_id is not null and destino_id is not null
        and origen_id <> destino_id
    end
  ),
  constraint abonos_viajes_check check (
    case
      when tipo = 'bono-10'
        then viajes_totales is not null and viajes_restantes is not null
          and viajes_restantes <= viajes_totales
      else viajes_totales is null and viajes_restantes is null
    end
  ),
  constraint abonos_qr_check check (qr is null or qr like 'RNA1.%')
);

comment on table public.abonos is
  'Abonos y bonos simulados (endpoints.md, «Abonos y bonos»). Lo crea la API pendiente de pago y lo activa el webhook, como una reserva.';
comment on column public.abonos.referencia is
  'Id público del abono (`AB-7K2M9Q`): es el `id` del objeto Abono y la clave `id` del QR RNA1.';
comment on column public.abonos.tipo is
  'ave-ld-mensual | avant-mensual | cercanias-recurrente | bono-10. Los literales son los del contrato.';
comment on column public.abonos.nombre is
  'Nombre comercial (p. ej. «Bono 10 viajes»). Se guarda para que el contrato devuelva `nombre` sin tabla de tarifas.';
comment on column public.abonos.origen_id is
  'Trayecto del abono. Nulo en `cercanias-recurrente`, obligatorio en el resto (abonos_trayecto_check).';
comment on column public.abonos.fin is
  'Último día válido, **inclusive**. Lo calcula la API: inicio + 30 días (abonos) o + 60 días (bono-10).';
comment on column public.abonos.viajes_restantes is
  'Nulo en los abonos ilimitados. `POST /billetes/validar` descuenta uno por viaje en el bono; a 0 el estado es `agotado`.';
comment on column public.abonos.estado is
  'pendiente | activo | anulado | caducado. `pendiente` = creado a la espera del pago; lo pasa a `activo` el webhook.';
comment on column public.abonos.qr is
  'QR firmado `RNA1.<datos>.<firma>` (Ed25519). Nulo mientras el abono está pendiente de pago: la API lo firma (y lo guarda) al activarlo.';

-- Lista de abonos del usuario, del más nuevo al más viejo (GET /abonos).
create index abonos_usuario_creado_idx
  on public.abonos (usuario_id, creado_en desc);
-- Barrido de abonos caducados (solo los vigentes).
create index abonos_fin_activo_idx
  on public.abonos (fin) where estado = 'activo';

create trigger abonos_actualizado_en
  before update on public.abonos
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 5.4 · billetes
-- -----------------------------------------------------------------------------
-- **1 billete = 1 butaca = 1 viajero** (decisión 2 de §10.1): una reserva de 3
-- plazas emite 3 billetes con 3 QR distintos y se puede anular uno sin tocar los
-- demás. Lo emite el webhook de pago, nunca el cliente.
--
-- `usuario_id`, `feed`, `viaje_id`, el trayecto y los datos de la butaca están
-- duplicados desde la reserva a propósito: el revisor valida un QR sin joins y
-- la política RLS se resuelve con una sola columna (§5.4).
--
-- Cambios sobre §5.4 del contrato (2026-10-29, al escribir esta migración):
--   · `fecha_servicio`: sin ella `otro_dia` y las horas `sal`/`lle` del QR
--     obligan a un join a `reservas` en cada escaneo. `expira_en` se sigue
--     calculando como `fecha_servicio + 26 h` (decisión 6 intacta).
--   · `origen_id`/`destino_id`: el billete se vende por trayecto, no por viaje
--     completo, y el QR lleva los nombres (`o`, `d`).
--   · `precio_centimos`: importe simulado del billete, copiado de la reserva.
--   · `qr`: el token firmado se guarda. §5.4 decía que no hacía falta porque la
--     firma se verifica con la clave pública, pero `GET /billetes/:id/qr` y el
--     objeto Abono piden devolverlo firmado: guardarlo lo hace idempotente y
--     permite distinguir `no_existe` (firma buena, id que no está en la BD).
--   · `actualizado_en`: el billete cambia de estado (`usado`, `anulado`,
--     `caducado`) y el trigger genérico exige este nombre.
create table public.billetes (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null
    references public.reservas (id) on delete restrict,
  asiento_id uuid not null
    references public.asientos (id) on delete restrict,
  usuario_id uuid
    references public.perfiles (id) on delete set null,
  feed text not null
    constraint billetes_feed_check check (feed in ('cercanias', 'avld')),
  viaje_id text not null,
  fecha_servicio date not null,
  origen_id text not null
    references public.estaciones (id) on delete restrict,
  destino_id text not null
    references public.estaciones (id) on delete restrict,
  coche smallint not null
    constraint billetes_coche_check check (coche between 1 and 20),
  asiento text not null
    constraint billetes_asiento_check check (length(btrim(asiento)) between 1 and 8),
  clase text not null
    constraint billetes_clase_check check (clase in ('turista', 'preferente')),
  precio_centimos integer not null
    constraint billetes_precio_check check (precio_centimos >= 0),
  estado text not null default 'valido'
    constraint billetes_estado_check
    check (estado in ('valido', 'usado', 'anulado', 'caducado')),
  qr text not null
    constraint billetes_qr_check check (qr like 'RNF1.%'),
  emitido_en timestamptz not null default now(),
  expira_en timestamptz not null,
  usado_en timestamptz,
  actualizado_en timestamptz not null default now(),
  constraint billetes_viaje_fkey
    foreign key (feed, viaje_id)
    references public.viajes (feed, id) on delete restrict,
  constraint billetes_asiento_key unique (asiento_id),
  constraint billetes_trayecto_check check (origen_id <> destino_id),
  constraint billetes_caducidad_check check (expira_en > emitido_en),
  constraint billetes_usado_check check (estado <> 'usado' or usado_en is not null)
);

comment on table public.billetes is
  'Un billete por butaca y viajero (decisión 2 de §10.1). Lo emite el webhook de pago; el cliente solo lee los suyos.';
comment on column public.billetes.asiento_id is
  'UNIQUE: 1 butaca = 1 billete. Es la red de seguridad que impide vender dos veces la misma butaca (§5.3).';
comment on column public.billetes.asiento is
  'Etiqueta del asiento tal y como la ve el revisor (`12A`, clave `as` del QR). Copia de `asientos` al emitir; no se recalcula.';
comment on column public.billetes.precio_centimos is
  'Precio simulado del billete, en céntimos. Se copia de la reserva para que un cambio de tarifa no reescriba el historial.';
comment on column public.billetes.expira_en is
  'fecha_servicio + 26 h = 02:00 del día siguiente en Europe/Madrid (decisión 6 de §10.1). La misma marca va en el `exp` del QR. Lo calcula la API al emitir.';
comment on column public.billetes.qr is
  'Token firmado `RNF1.<datos>.<firma>` (Ed25519 con QR_SIGNING_PRIVATE_KEY). `datos` lleva las claves cortas del contrato: v, id, rid, loc, tipo, num, sal, lle, o, d, co, as, cl, p, doc. Como el QR firma el id del billete, la API genera el uuid antes de insertar (el default no sirve aquí).';
comment on column public.billetes.estado is
  'valido | usado | anulado | caducado. Es lo que manda: firma válida + estado valido = billete bueno (§5.4).';

-- «Mis billetes», del más nuevo al más viejo.
create index billetes_usuario_emitido_idx
  on public.billetes (usuario_id, emitido_en desc);
-- Panel del revisor y del admin por viaje.
create index billetes_feed_viaje_estado_idx
  on public.billetes (feed, viaje_id, estado);
-- Barrido de caducidad (solo los válidos).
create index billetes_expira_valido_idx
  on public.billetes (expira_en) where estado = 'valido';
-- `on delete restrict` de reservas y de asientos comprueba por aquí.
create index billetes_reserva_idx on public.billetes (reserva_id);

create trigger billetes_actualizado_en
  before update on public.billetes
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 5.5 · validaciones
-- -----------------------------------------------------------------------------
-- Tabla **append-only**: también se apunta el intento fallido, porque «este QR
-- no vale» es justo lo que hay que poder auditar. Nunca se actualiza ni se
-- borra; `billetes.estado` es el estado actual y esto es el histórico (§5.5).
--
-- `resultado` usa los literales de la respuesta de `POST /billetes/validar`
-- (endpoints.md, 2026-10-28), que sustituyen a los de §5.5 del modelo:
--   valido | ya_validado | otro_dia | caducado | anulado | falso | no_existe | agotado
--   (`ya_usado` → `ya_validado`, `firma_invalida` → `falso`, `no_encontrado` → `no_existe`,
--    y `agotado` es el bono sin viajes).
--
-- `billete_id` y `abono_id` son nulos porque un QR `falso` no tiene nada detrás y
-- un `no_existe` tiene firma pero no fila. Como mucho uno de los dos, nunca los dos.
create table public.validaciones (
  id uuid primary key default gen_random_uuid(),
  billete_id uuid
    references public.billetes (id) on delete restrict,
  abono_id uuid
    references public.abonos (id) on delete restrict,
  revisor_id uuid
    references public.perfiles (id) on delete set null,
  resultado text not null
    constraint validaciones_resultado_check check (resultado in (
      'valido', 'ya_validado', 'otro_dia', 'caducado',
      'anulado', 'falso', 'no_existe', 'agotado'
    )),
  motivo text,
  validado_en timestamptz not null default now(),
  constraint validaciones_un_objeto_check check (billete_id is null or abono_id is null)
);

comment on table public.validaciones is
  'Histórico append-only de escaneos de QR (billete o abono). Nunca se actualiza ni se borra.';
comment on column public.validaciones.resultado is
  'Literales de POST /billetes/validar: valido | ya_validado | otro_dia | caducado | anulado | falso | no_existe | agotado.';
comment on column public.validaciones.billete_id is
  'Nulo en los QR de abono y en los que no están en la BD (`falso`, `no_existe`).';
comment on column public.validaciones.abono_id is
  'Nulo en los QR de billete (prefijo RNF1). Los abonos usan prefijo RNA1.';
comment on column public.validaciones.revisor_id is
  'Nulo solo si se ha borrado la cuenta del revisor: la validación se queda como historial (§8).';
comment on column public.validaciones.motivo is
  'Texto libre del revisor o del motivo del rechazo.';

-- `primeraValidacion` (min) y el histórico de un billete.
create index validaciones_billete_idx
  on public.validaciones (billete_id, validado_en desc);
-- Lo que ha validado cada revisor (su panel).
create index validaciones_revisor_idx
  on public.validaciones (revisor_id, validado_en desc);
-- Viajes restantes y validaciones del abono.
create index validaciones_abono_idx
  on public.validaciones (abono_id, validado_en desc);

-- -----------------------------------------------------------------------------
-- RLS · cada usuario ve lo suyo, el revisor lo suyo (§7)
-- -----------------------------------------------------------------------------
-- Supabase concede ALL a `anon` y `authenticated` en las tablas nuevas de
-- `public` (auto_expose_new_tables). Se revoca y se dan permisos mínimos: sin
-- esto, un `anon` con la clave pública podría escribir.
--
-- Nadie escribe desde la app: reservas, asientos, billetes, abonos y
-- validaciones los mueve la API con `service_role`, que salta RLS. `anon` no
-- tiene ni SELECT (son datos personales).
--
-- `auth.uid()` se envuelve en un subselect para que Postgres lo evalúe una vez
-- por consulta y no una vez por fila (patrón de Supabase).

alter table public.reservas enable row level security;
revoke all on public.reservas from anon, authenticated;
grant select on public.reservas to authenticated;

create policy reservas_select_propias on public.reservas
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

alter table public.asientos enable row level security;
revoke all on public.asientos from anon, authenticated;
grant select on public.asientos to authenticated;

-- El mapa de butacas es de todos los usuarios logados: no es dato personal.
create policy asientos_lectura on public.asientos
  for select to authenticated
  using (true);

alter table public.abonos enable row level security;
revoke all on public.abonos from anon, authenticated;
grant select on public.abonos to authenticated;

create policy abonos_select_propios on public.abonos
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

alter table public.billetes enable row level security;
revoke all on public.billetes from anon, authenticated;
grant select on public.billetes to authenticated;

create policy billetes_select_propios on public.billetes
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

alter table public.validaciones enable row level security;
revoke all on public.validaciones from anon, authenticated;
grant select on public.validaciones to authenticated;

-- El viajero no lee nada de aquí; el revisor (y el admin, que valida) ven las
-- validaciones que han hecho ellos. El billete ajeno no se lee ni por join.
create policy validaciones_select_propias on public.validaciones
  for select to authenticated
  using ((select auth.uid()) = revisor_id);
