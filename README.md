# Gestión de Productos — CRUD con Angular y Firebase

Práctica 02.2 de **Programación y Plataformas Web** (Universidad Politécnica Salesiana).

Aplicación web en Angular que administra la colección `productos` de **Cloud Firestore**: permite registrar, consultar, editar y eliminar productos desde un formulario validado y una tabla que se actualiza después de cada operación.

**URL pública (Vercel):** https://ppw-crud-productos-firebase.vercel.app  
**Repositorio:** https://github.com/DannielS110/ppw-crud-productos-firebase

## Funciones del CRUD

| Operación | Cómo se usa | Método en `ProductoService` |
|---|---|---|
| Crear | Completar el formulario y pulsar **Registrar** | `crear(producto)` → `addDoc` |
| Consultar | La tabla se carga al abrir la página (botón **Recargar**) | `listar()` → `getDocs` |
| Actualizar | Pulsar **Editar** en una fila, modificar y **Guardar cambios** | `actualizar(id, producto)` → `updateDoc` |
| Eliminar | Pulsar **Eliminar** y confirmar el diálogo (al cancelar, el producto se conserva) | `eliminar(id)` → `deleteDoc` |

Validaciones del formulario:
- `nombre` y `categoria`: obligatorios y con texto (no se aceptan solo espacios).
- `precio`: numérico y mayor o igual a 0.
- `stock`: número entero mayor o igual a 0.

Si una operación falla se muestra un mensaje de error, y si la colección está vacía se muestra un aviso.

## Modelo de producto

```ts
interface Producto {
  id?: string;      // id del documento en Firestore (no se guarda como campo)
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}
```

## Estructura

```
src/app/
├── firebase.config.ts          # initializeApp + instancia de Firestore
├── models/producto.ts          # interfaz Producto
├── services/producto.service.ts# acceso a Firestore (las 4 operaciones)
└── productos/                  # componente con formulario y tabla
scripts/set-env.mjs             # genera environment.ts desde variables de entorno
firestore.rules                 # reglas de seguridad de la colección
```

Las credenciales de Firebase **no están en el repositorio**: `scripts/set-env.mjs` genera `src/environments/environment.ts` (ignorado por Git) a partir del archivo `.env` en local o de las variables de entorno de Vercel.

## Configuración de Firebase

1. Entrar a <https://console.firebase.google.com> y crear un proyecto.
2. En **Build → Firestore Database**, crear la base de datos.
3. En la pestaña **Reglas**, pegar el contenido de `firestore.rules` y publicar.
4. En **Configuración del proyecto → Tus apps**, registrar una app web (`</>`) y copiar los valores de `firebaseConfig`.

## Instalación y ejecución local

Requisitos: Node.js 20 o superior.

```bash
git clone https://github.com/DannielS110/ppw-crud-productos-firebase.git
cd ppw-crud-productos-firebase
npm install
cp .env.example .env      # en Windows: copy .env.example .env
```

Completar `.env` con los valores de `firebaseConfig`:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

Ejecutar:

```bash
npm start        # http://localhost:4200
npm test         # pruebas unitarias del componente
npm run build    # compilación de producción en dist/my-angular-app/browser
```

## Despliegue en Vercel

1. Importar el repositorio de GitHub en <https://vercel.com/new>.
2. Vercel detecta Angular; `vercel.json` ya define `npm run build` y la carpeta `dist/my-angular-app/browser`.
3. En **Settings → Environment Variables**, agregar las seis variables `FIREBASE_*` del archivo `.env`.
4. Desplegar y abrir la URL pública.
