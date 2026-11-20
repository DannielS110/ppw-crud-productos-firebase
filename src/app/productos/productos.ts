import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../models/producto';
import { ProductoService } from '../services/producto.service';

/** Rechaza textos vacíos o formados solo por espacios. */
function textoValido(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.trim().length > 0 ? null : { textoVacio: true };
}

/** Exige un número (no texto ni vacío). */
function numerico(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '') return null; // lo cubre "required"
  return typeof valor === 'number' && Number.isFinite(valor) ? null : { noNumerico: true };
}

/** Exige un número entero. */
function entero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '') return null;
  return Number.isInteger(valor) ? null : { noEntero: true };
}

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  private readonly servicio = inject(ProductoService);
  private readonly fb = inject(FormBuilder);

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);

  readonly form = this.fb.group({
    nombre: this.fb.control('', [Validators.required, textoValido]),
    precio: this.fb.control<number | null>(null, [Validators.required, numerico, Validators.min(0)]),
    stock: this.fb.control<number | null>(null, [Validators.required, numerico, entero, Validators.min(0)]),
    categoria: this.fb.control('', [Validators.required, textoValido]),
  });

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      this.productos.set(await this.servicio.listar());
    } catch (e) {
      this.mostrarError('No se pudieron cargar los productos', e);
    } finally {
      this.cargando.set(false);
    }
  }

  async guardar(): Promise<void> {
    this.aviso.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const producto = this.form.getRawValue() as Producto;
    const id = this.editandoId();
    this.guardando.set(true);
    try {
      if (id) {
        await this.servicio.actualizar(id, producto);
        this.aviso.set('Producto actualizado.');
      } else {
        await this.servicio.crear(producto);
        this.aviso.set('Producto registrado.');
      }
      this.limpiar();
      await this.cargar();
    } catch (e) {
      this.mostrarError(id ? 'No se pudo actualizar el producto' : 'No se pudo registrar el producto', e);
    } finally {
      this.guardando.set(false);
    }
  }

  editar(p: Producto): void {
    this.aviso.set(null);
    this.error.set(null);
    this.editandoId.set(p.id ?? null);
    this.form.setValue({
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      categoria: p.categoria,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async eliminar(p: Producto): Promise<void> {
    if (!p.id) return;
    const ok = window.confirm(`¿Eliminar el producto "${p.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) {
      this.aviso.set('Eliminación cancelada. El producto se conserva.');
      return;
    }
    try {
      await this.servicio.eliminar(p.id);
      if (this.editandoId() === p.id) this.limpiar();
      this.aviso.set('Producto eliminado.');
      await this.cargar();
    } catch (e) {
      this.mostrarError('No se pudo eliminar el producto', e);
    }
  }

  limpiar(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', precio: null, stock: null, categoria: '' });
  }

  /** Muestra errores de un campo solo después de que el usuario lo tocó. */
  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  private mostrarError(mensaje: string, e: unknown): void {
    console.error(e);
    const detalle = e instanceof Error ? e.message : String(e);
    this.error.set(`${mensaje}: ${detalle}`);
  }
}
