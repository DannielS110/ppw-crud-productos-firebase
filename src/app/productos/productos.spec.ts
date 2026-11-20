import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Productos } from './productos';
import { ProductoService } from '../services/producto.service';
import { Producto } from '../models/producto';

/** Servicio falso en memoria para probar el componente sin Firestore. */
class ServicioFalso {
  datos: Producto[] = [];
  private n = 0;
  async listar() { return this.datos.map((p) => ({ ...p })); }
  async crear(p: Producto) { const id = `id${++this.n}`; this.datos.push({ ...p, id }); return id; }
  async actualizar(id: string, p: Producto) { this.datos = this.datos.map((d) => (d.id === id ? { ...p, id } : d)); }
  async eliminar(id: string) { this.datos = this.datos.filter((d) => d.id !== id); }
}

describe('Productos', () => {
  let servicio: ServicioFalso;

  async function crearComponente() {
    const fixture = TestBed.createComponent(Productos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    servicio = new ServicioFalso();
    await TestBed.configureTestingModule({
      imports: [Productos],
      providers: [{ provide: ProductoService, useValue: servicio }],
    }).compileComponents();
  });

  it('muestra mensaje cuando la colección está vacía', async () => {
    const f = await crearComponente();
    expect(f.nativeElement.textContent).toContain('No hay productos registrados');
  });

  it('crea, edita y elimina un producto', async () => {
    const f = await crearComponente();
    const c = f.componentInstance;

    c.form.setValue({ nombre: 'Mouse', precio: 12.5, stock: 3, categoria: 'Periféricos' });
    await c.guardar();
    f.detectChanges();
    expect(servicio.datos.length).toBe(1);
    expect(f.nativeElement.querySelectorAll('tbody tr').length).toBe(1);

    c.editar(c.productos()[0]);
    c.form.controls.precio.setValue(15);
    await c.guardar();
    expect(servicio.datos[0].precio).toBe(15);
    expect(servicio.datos[0].id).toBe('id1');

    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await c.eliminar(c.productos()[0]);
    expect(servicio.datos.length).toBe(1);
    confirmar.mockReturnValueOnce(true);
    await c.eliminar(c.productos()[0]);
    expect(servicio.datos.length).toBe(0);
  });

  it('rechaza nombre vacío, precio negativo y stock fraccionario', async () => {
    const f = await crearComponente();
    const c = f.componentInstance;
    c.form.setValue({ nombre: '   ', precio: -1, stock: 2.5, categoria: 'X' });
    await c.guardar();
    f.detectChanges();
    expect(servicio.datos.length).toBe(0);
    const texto = f.nativeElement.textContent;
    expect(texto).toContain('El nombre es obligatorio');
    expect(texto).toContain('mayor o igual a 0');
    expect(texto).toContain('número entero');
  });
});
