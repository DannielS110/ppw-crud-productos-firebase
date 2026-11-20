import { Component } from '@angular/core';
import { Productos } from './productos/productos';

@Component({
  imports: [Productos],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
