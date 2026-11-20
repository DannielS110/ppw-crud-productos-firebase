// Genera src/environments/environment.ts a partir de variables de entorno.
// En local las lee del archivo .env; en Vercel, de Settings > Environment Variables.
// Así las credenciales de Firebase no quedan guardadas en el repositorio.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  for (const linea of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const claves = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
};

const faltantes = Object.values(claves).filter((v) => !process.env[v]);
if (faltantes.length) {
  console.warn(`[set-env] Faltan variables: ${faltantes.join(', ')}`);
}

const firebase = Object.fromEntries(
  Object.entries(claves).map(([campo, variable]) => [campo, process.env[variable] ?? '']),
);

mkdirSync('src/environments', { recursive: true });
writeFileSync(
  'src/environments/environment.ts',
  `// Archivo generado por scripts/set-env.mjs. No editar ni subir a GitHub.\n` +
    `export const environment = ${JSON.stringify({ firebase }, null, 2)};\n`,
);
console.log('[set-env] src/environments/environment.ts generado');
