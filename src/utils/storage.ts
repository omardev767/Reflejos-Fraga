import { Producto, Venta, Respaldo } from '../types';

export const UMBRAL_STOCK_BAJO = 3;
export const MAX_RESPALDOS = 10;

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmt = (n: number | undefined | null): string => {
  return '$' + Number(n || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const normalizar = (s: string | undefined | null): string => {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const fechaHora = (ts: number): string => {
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const inicioDelDia = (d: Date = new Date()): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const inicioSemana = (d: Date = new Date()): Date => {
  const x = new Date(d);
  const dia = x.getDay();
  x.setDate(x.getDate() + (dia === 0 ? -6 : 1 - dia));
  x.setHours(0, 0, 0, 0);
  return x;
};

export const inicioMes = (d: Date = new Date()): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

export const TIPOS_ESPEJO_DEFAULT = [
  'Sin marco',
  'Con marco',
  'Biselado',
  'Redondo',
  'Rectangular',
  'Cuadrado',
  'Ovalado',
  'Decorativo',
  'Baño',
  'Cuerpo entero',
  'LED',
];

// Datos iniciales de demostración para Reflejos Fraga si no hay datos en localStorage
const PRODUCTOS_INICIALES: Producto[] = [
  { id: 'p1', nombre: 'Espejo Redondo Biselado 60cm', tipo: 'Biselado', costo: 280, precio: 590, stock: 8 },
  { id: 'p2', nombre: 'Espejo LED Touch Baño 80x60cm', tipo: 'LED', costo: 750, precio: 1450, stock: 5 },
  { id: 'p3', nombre: 'Espejo Cuerpo Entero Marco Negro 160x50cm', tipo: 'Cuerpo entero', costo: 620, precio: 1290, stock: 4 },
  { id: 'p4', nombre: 'Espejo Ovalado Clásico 70x50cm', tipo: 'Ovalado', costo: 310, precio: 680, stock: 2 }, // Stock bajo
  { id: 'p5', nombre: 'Espejo Decorativo Sol Dorado 75cm', tipo: 'Decorativo', costo: 480, precio: 1100, stock: 0 }, // Agotado
  { id: 'p6', nombre: 'Espejo Rectangular Simple 50x70cm', tipo: 'Sin marco', costo: 190, precio: 420, stock: 12 },
];

export const getStoredProductos = (): Producto[] => {
  try {
    const raw = localStorage.getItem('esp_productos');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('esp_productos', JSON.stringify(PRODUCTOS_INICIALES));
    return PRODUCTOS_INICIALES;
  } catch {
    return PRODUCTOS_INICIALES;
  }
};

export const getStoredVentas = (): Venta[] => {
  try {
    const raw = localStorage.getItem('esp_ventas');
    if (raw) return JSON.parse(raw);
    // Generar algunas ventas de ejemplo para hoy y días anteriores
    const hoyTs = Date.now();
    const ventasDemo: Venta[] = [
      {
        id: 'v1',
        ts: hoyTs - 1000 * 60 * 90,
        productoId: 'p1',
        producto: 'Espejo Redondo Biselado 60cm',
        tipo: 'Biselado',
        cliente: 'Carlos Mendoza',
        cantidad: 1,
        precio: 590,
        costo: 280,
        importe: 590,
        ganancia: 310,
      },
      {
        id: 'v2',
        ts: hoyTs - 1000 * 60 * 30,
        productoId: 'p2',
        producto: 'Espejo LED Touch Baño 80x60cm',
        tipo: 'LED',
        cliente: 'Hotel Boutique Imperial',
        cantidad: 2,
        precio: 1450,
        costo: 750,
        importe: 2900,
        ganancia: 1400,
      },
      {
        id: 'v3',
        ts: hoyTs - 1000 * 60 * 60 * 26,
        productoId: 'p3',
        producto: 'Espejo Cuerpo Entero Marco Negro 160x50cm',
        tipo: 'Cuerpo entero',
        cliente: 'Ana Sofía Garza',
        cantidad: 1,
        precio: 1290,
        costo: 620,
        importe: 1290,
        ganancia: 670,
      },
    ];
    localStorage.setItem('esp_ventas', JSON.stringify(ventasDemo));
    return ventasDemo;
  } catch {
    return [];
  }
};

export const getStoredRespaldos = (): Respaldo[] => {
  try {
    const raw = localStorage.getItem('esp_respaldos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRespaldos = (respaldos: Respaldo[]) => {
  try {
    localStorage.setItem('esp_respaldos', JSON.stringify(respaldos));
  } catch (e) {
    console.error('Error al guardar respaldos en localStorage', e);
  }
};
