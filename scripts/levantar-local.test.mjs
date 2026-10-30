import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fusionarEnv, leerEnvSupabase } from "./levantar-local.mjs";

const supabase = { ANON_KEY: "anon", SERVICE_ROLE_KEY: "service", JWT_SECRET: "jwt" };

test("rellena las claves de Supabase local y respeta lo que ya tenía el usuario", () => {
  const antes = "# comentario\nDATABASE_URL=postgresql://otra\nSTRIPE_SECRET_KEY=sk_test_mia\nQR_SIGNING_SECRET=\n";
  const env = fusionarEnv(antes, supabase, () => "aleatorio");
  assert.match(env, /^# comentario$/m);
  assert.match(env, /^DATABASE_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres$/m);
  assert.match(env, /^STRIPE_SECRET_KEY=sk_test_mia$/m);
  assert.match(env, /^QR_SIGNING_SECRET=aleatorio$/m);
  assert.match(env, /^SUPABASE_JWT_SECRET=jwt$/m);
  assert.match(env, /^CORS_ORIGINS=.*localhost:8081$/m);
});

test("no cambia un QR_SIGNING_SECRET que ya existe", () => {
  const env = fusionarEnv("QR_SIGNING_SECRET=el-mio\n", supabase, () => "otro");
  assert.match(env, /^QR_SIGNING_SECRET=el-mio$/m);
});

test("lee la salida de `supabase status -o env`", () => {
  assert.deepEqual(leerEnvSupabase('API_URL="http://127.0.0.1:54321"\nJWT_SECRET="s3cr3t"\n'), {
    API_URL: "http://127.0.0.1:54321",
    JWT_SECRET: "s3cr3t",
  });
});
