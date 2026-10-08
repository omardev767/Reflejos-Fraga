import React, { useState, useMemo } from 'react';
import { Producto } from '../../types';
import { fmt, normalizar, UMBRAL_STOCK_BAJO } from '../../utils/storage';
import {
  CreditCard,
  Search,
  X,
  User,
  ShoppingBag,
  TrendingUp,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface NuevaVentaTabProps {
  productos: Producto[];
  clientesRecientes: string[];
  onRegistrarVenta: (data: {
    productoId: string;
    cantidad: number;
    cliente: string;
  }) => void;
}

export default function NuevaVentaTab({
  productos,
  clientesRecientes,
  onRegistrarVenta,
}: NuevaVentaTabProps) {
  const [search, setSearch] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [cliente, setCliente] = useState('');

  // Filtrar productos para el select
  const q = normalizar(search);
  const productosFiltrados = useMemo(() => {
    if (!q) return productos;
    return productos.filter(
      (p) => normalizar(p.nombre).includes(q) || normalizar(p.tipo).includes(q)
    );
  }, [productos, q]);

  // Si busca y solo hay 1 producto filtrado y no hay seleccionado, preseleccionarlo
  const productoSeleccionado = useMemo(() => {
    return productos.find((p) => p.id === selectedProdId) || null;
  }, [productos, selectedProdId]);

  const handleSelectProduct = (id: string) => {
    setSelectedProdId(id);
    setCantidad(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) {
      alert('Selecciona un producto para la venta.');
      return;
    }
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    if (cantidad > productoSeleccionado.stock) {
      alert(`Stock insuficiente. Solo quedan ${productoSeleccionado.stock} unidades disponibles.`);
      return;
    }

    onRegistrarVenta({
      productoId: productoSeleccionado.id,
      cantidad,
      cliente: cliente.trim() || 'Cliente general',
    });

    // Resetear formulario
    setCantidad(1);
    setCliente('');
    setSelectedProdId('');
    setSearch('');
  };

  const importeTotal = productoSeleccionado ? productoSeleccionado.precio * cantidad : 0;
  const gananciaTotal = productoSeleccionado
    ? (productoSeleccionado.precio - productoSeleccionado.costo) * cantidad
    : 0;
  const stockRestante = productoSeleccionado ? productoSeleccionado.stock - cantidad : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Registrar Venta
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona el espejo vendido, la cantidad y el cliente
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Barra de búsqueda de productos rápida */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Buscar espejo en catálogo
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nombre o tipo..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selector de Producto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Producto seleccionado *
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">-- Selecciona un espejo --</option>
                {productosFiltrados.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.nombre} — {fmt(p.precio)} ({p.stock > 0 ? `Stock: ${p.stock}` : 'AGOTADO'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Cantidad a vender *
              </label>
              <input
                type="number"
                min="1"
                max={productoSeleccionado ? productoSeleccionado.stock : 9999}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                required
                disabled={!productoSeleccionado || productoSeleccionado.stock <= 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Cliente y Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nombre del Cliente (Opcional)
              </label>
              <input
                type="text"
                list="clientesList"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej: Decoraciones San Pedro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <datalist id="clientesList">
                {clientesRecientes.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tipo de Espejo
              </label>
              <input
                type="text"
                value={productoSeleccionado ? productoSeleccionado.tipo : ''}
                readOnly
                placeholder="Se auto-completa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Panel de Detalle en Vivo */}
          <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/20 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/10">
            {!productoSeleccionado ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm italic py-2">
                <Package className="w-4 h-4" />
                Selecciona un producto para visualizar el importe y la ganancia
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {productoSeleccionado.nombre}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {productoSeleccionado.tipo}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Precio unitario: <b className="text-slate-900 dark:text-slate-200">{fmt(productoSeleccionado.precio)}</b>
                  </span>
                  <span>
                    Costo unitario: <b>{fmt(productoSeleccionado.costo)}</b>
                  </span>
                  <span>
                    Stock actual: <b className={productoSeleccionado.stock <= UMBRAL_STOCK_BAJO ? 'text-amber-600' : 'text-emerald-600'}>{productoSeleccionado.stock}</b>
                  </span>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Total a cobrar:</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {fmt(importeTotal)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Ganancia neta estimada:</span>
                    <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      +{fmt(gananciaTotal)}
                    </div>
                  </div>
                </div>

                {/* Advertencias de stock */}
                {stockRestante <= 0 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Esta venta dejará el producto AGOTADO en inventario.
                  </div>
                ) : stockRestante <= UMBRAL_STOCK_BAJO ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Atención: Quedarán solo {stockRestante} unidades de este espejo.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <button
            type="submit"
            disabled={!productoSeleccionado || productoSeleccionado.stock <= 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5" />
            Registrar Venta
          </button>
        </form>
      </div>
    </div>
  );
}
