-- Reconocimiento facial (ADR-007).
-- Depende de 20261028120100_identidad.sql: usa `perfiles` y `embeddings_faciales`,
-- que son de Marina. Aquí no se crea ninguna de las dos.
-- Requiere pgvector >= 0.7 (`l2_normalize` y `vector_norm`); Supabase lo trae.

create extension if not exists vector with schema extensions;
set search_path = public, extensions, pg_temp;

-- ---------------------------------------------------------------------------
-- perfiles.rol: añadir `admin`
-- `resetear_cara` necesita un rol que no es de la app. El CHECK es de Marina;
-- esto lo amplía sin quitarle nada. Si ella lo mete en su migración, esta línea
-- sobra y se puede borrar.
-- ---------------------------------------------------------------------------

alter table perfiles drop constraint if exists perfiles_rol_check;
alter table perfiles add constraint perfiles_rol_check
  check (rol in ('viajero', 'revisor', 'admin'));

-- ---------------------------------------------------------------------------
-- config_cara: una sola fila. El umbral es dato, no código.
-- ---------------------------------------------------------------------------

create table config_cara (
  id boolean primary key default true check (id),
  modelo text not null,
  umbral real not null check (umbral between 0 and 1),
  actualizado_en timestamptz not null default now()
);

-- Valor provisional; se ajusta midiendo ~10 intentos propios y ~10 ajenos.
insert into config_cara (modelo, umbral) values ('arcface/buffalo_l', 0.6);

alter table config_cara enable row level security;
revoke all on config_cara from anon, authenticated;

-- ---------------------------------------------------------------------------
-- registrar_cara: alta única de la plantilla
-- ---------------------------------------------------------------------------

create function registrar_cara(p_usuario uuid, p_embedding vector, p_modelo text)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_modelo text;
begin
  select c.modelo into v_modelo from config_cara c where c.id;

  if p_modelo is distinct from v_modelo then
    raise exception 'modelo_distinto' using errcode = 'RF001';
  end if;
  if p_embedding is null or vector_dims(p_embedding) <> 512 then
    raise exception 'dimension_incorrecta' using errcode = 'RF002';
  end if;
  if vector_norm(p_embedding) = 0 then
    raise exception 'embedding_vacio' using errcode = 'RF003';
  end if;
  if p_usuario is null then
    raise exception 'usuario_inexistente' using errcode = 'RF005';
  end if;

  insert into embeddings_faciales (usuario_id, embedding, modelo)
  values (p_usuario, l2_normalize(p_embedding), v_modelo);
exception
  when unique_violation then
    raise exception 'cara_ya_registrada' using errcode = 'RF004';
  when foreign_key_violation then
    -- La FK de `embeddings_faciales` va a `perfiles`: sin perfil no hay cara.
    raise exception 'usuario_inexistente' using errcode = 'RF005';
end;
$$;

-- ---------------------------------------------------------------------------
-- verificar_cara: compara y decide. 1:1, el usuario dice quién es.
-- ---------------------------------------------------------------------------

create function verificar_cara(p_email text, p_embedding vector)
returns table (usuario_id uuid, coincide boolean, similitud real, motivo text)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_config config_cara;
  v_usuario uuid;
  v_plantilla embeddings_faciales;
  v_sim real;
begin
  select c.* into v_config from config_cara c where c.id;

  select u.id into v_usuario from auth.users u where lower(u.email) = lower(p_email);
  if v_usuario is null then
    return query select null::uuid, false, null::real, 'sin_plantilla';
    return;
  end if;

  select e.* into v_plantilla from embeddings_faciales e where e.usuario_id = v_usuario;
  if not found then
    -- Mismo resultado que un email inexistente: el endpoint no debe distinguirlos.
    return query select null::uuid, false, null::real, 'sin_plantilla';
    return;
  end if;

  if v_plantilla.modelo <> v_config.modelo then
    return query select v_usuario, false, null::real, 'modelo_distinto';
    return;
  end if;

  v_sim := 1 - (v_plantilla.embedding <=> l2_normalize(p_embedding));

  return query select
    v_usuario,
    v_sim >= v_config.umbral,
    v_sim,
    case when v_sim >= v_config.umbral then 'ok' else 'no_coincide' end;
end;
$$;

-- ---------------------------------------------------------------------------
-- resetear_cara: solo un admin puede borrar la plantilla (el registro es único).
-- El rol se lee de `perfiles.rol`, que es donde vive según el contrato.
-- ---------------------------------------------------------------------------

create function resetear_cara(p_admin uuid, p_usuario uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if not exists (
    select 1 from perfiles p
    where p.id = p_admin and p.rol = 'admin'
  ) then
    raise exception 'no_autorizado' using errcode = 'RF006';
  end if;

  delete from embeddings_faciales e where e.usuario_id = p_usuario;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos: las funciones son de `service_role` y de nadie más.
-- ---------------------------------------------------------------------------

revoke all on function registrar_cara(uuid, vector, text) from public, anon, authenticated;
revoke all on function verificar_cara(text, vector) from public, anon, authenticated;
revoke all on function resetear_cara(uuid, uuid) from public, anon, authenticated;

grant execute on function registrar_cara(uuid, vector, text) to service_role;
grant execute on function verificar_cara(text, vector) to service_role;
grant execute on function resetear_cara(uuid, uuid) to service_role;

-- shortcut: no hay límite de intentos por usuario; el 429 global llega en la fase F7.
-- Mientras tanto, el facial es alternativa a la contraseña, nunca el único factor.

-- No dejar `extensions` en el search_path de las migraciones siguientes.
reset search_path;
