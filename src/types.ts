export interface Producto {
  id: string;
  nombre: string;
  tipo: string;
  costo: number;
  precio: number;
  stock: number;
}

export interface Venta {
  id: string;
  ts: number;
  productoId: string;
  producto: string;
  tipo: string;
  cliente: string;
  cantidad: number;
  precio: number;
  costo: number;
  importe: number;
  ganancia: number;
}

export interface Respaldo {
  id: string;
  fecha: number;
  productos: Producto[];
  ventas: Venta[];
  resumen: {
    numProductos: number;
    numVentas: number;
    totalVentas: number;
  };
}

export type RangoTipo = 'hoy' | 'semana' | 'mes' | 'mesAnterior' | 'todo' | 'personalizado';
