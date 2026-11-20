export interface Producto {
  /** Identificador del documento en Firestore (no se guarda como campo). */
  id?: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}
