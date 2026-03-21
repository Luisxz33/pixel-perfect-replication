import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outPath = path.join(projectRoot, "public", "auth-config.js");

const parseDotEnv = (text) => {
  const out = {};
  const lines = String(text || "").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }
  return out;
};

const readIfExists = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};

const envFromProcess = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
};

const envLocal = parseDotEnv(readIfExists(path.join(projectRoot, ".env.local")));
const env = {
  ...envLocal,
  ...envFromProcess,
};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    "[generate-auth-config] Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY (.env.local).";
  console.warn(message);
}

const escapeJs = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

const content = `// Auto-gerado. Não edite manualmente.\nwindow.__SUPABASE_URL__ = \"${escapeJs(supabaseUrl || "")}\";\nwindow.__SUPABASE_ANON_KEY__ = \"${escapeJs(supabaseAnonKey || "")}\";\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, "utf8");
console.log(`[generate-auth-config] OK -> ${path.relative(projectRoot, outPath)}`);
