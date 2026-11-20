import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Producto } from '../models/producto';

/** Todo el acceso a la colección "productos" de Cloud Firestore pasa por aquí. */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly productosRef = collection(db, 'productos');

  /** Consultar: devuelve todos los productos ordenados por nombre. */
  async listar(): Promise<Producto[]> {
    const snapshot = await getDocs(query(this.productosRef, orderBy('nombre')));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Producto, 'id'>) }));
  }

  /** Crear: agrega un documento nuevo y devuelve su id. */
  async crear(producto: Producto): Promise<string> {
    const ref = await addDoc(this.productosRef, this.datos(producto));
    return ref.id;
  }

  /** Actualizar: sobrescribe los campos del documento con ese id. */
  async actualizar(id: string, producto: Producto): Promise<void> {
    await updateDoc(doc(db, 'productos', id), this.datos(producto));
  }

  /** Eliminar: borra el documento con ese id. */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'productos', id));
  }

  private datos(p: Producto): Omit<Producto, 'id'> {
    return {
      nombre: p.nombre.trim(),
      precio: Number(p.precio),
      stock: Number(p.stock),
      categoria: p.categoria.trim(),
    };
  }
}
