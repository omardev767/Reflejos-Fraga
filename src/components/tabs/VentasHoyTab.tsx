import React, { useState } from 'react';
import { Venta } from '../../types';
import { fmt, normalizar } from '../../utils/storage';
import {
  Calendar,
  Search,
  X,
  Printer,
  FileSpreadsheet,
  Trash2,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
} from 'lucide-react';

interface VentasHoyTabProps {
  ventasHoy: Venta[];
  onEliminarVenta: (id: string) => void;
  onExportarExcel: () => void;
  onImprimir: () => void;
}

export default function VentasHoyTab({
  ventasHoy,
  onEliminarVenta,
  onExportarExcel,
  onImprimir,
}: VentasHoyTabProps) {
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // KPIs de hoy
  const totalImporte = ventasHoy.reduce((s, v) => s + v.importe, 0);
  const totalGanancia = ventasHoy.reduce((s, v) => s + v.ganancia, 0);
  const totalUnidades = ventasHoy.reduce((s, v) => s + v.cantidad, 0);

  // Filtrado
  const q = normalizar(search);
  const filtradas = q
    ? ventasHoy.filter(
        (v) =>
          normalizar(v.producto).includes(q) ||
          normalizar(v.cliente).includes(q) ||
          normalizar(v.tipo).includes(q)
      )
    : ventasHoy;

  return (
    <div className="space-y-6">
      {/* KPIs de Hoy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Total Vendido
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {fmt(totalImporte)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            Ganancia Neta
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {fmt(totalGanancia)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
            N° Ventas
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {ventasHoy.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-amber-500" />
            Unidades
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalUnidades}
          </div>
        </div>
      </div>

      {/* Lista de ventas de hoy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Detalle de Ventas del Día
          </h3>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por producto o cliente..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {search && (
          <div className="text-xs text-slate-500">
            Mostrando <span className="font-bold text-indigo-600 dark:text-indigo-400">{filtradas.length}</span> de {ventasHoy.length} ventas de hoy
          </div>
        )}

        {filtradas.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {ventasHoy.length === 0
              ? 'No hay ventas registradas el día de hoy.'
              : 'Sin resultados para la búsqueda actual.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">Hora</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3 text-center">Cant.</th>
                  <th className="py-3 px-3">Precio</th>
                  <th className="py-3 px-3">Importe</th>
                  <th className="py-3 px-3">Ganancia</th>
                  <th className="py-3 px-3 text-right">Anular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtradas.map((v) => {
                  const hora = new Date(v.ts).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-xs text-slate-500">
                        {hora}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {v.producto}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {v.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {v.cliente}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {v.cantidad}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {fmt(v.precio)}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-indigo-600 dark:text-indigo-400">
                        {fmt(v.importe)}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        +{fmt(v.ganancia)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(v.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Anular venta y devolver stock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Botones de Exportar / Imprimir */}
        {ventasHoy.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onImprimir}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF (B/N)
            </button>

            <button
              onClick={onExportarExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Exportar a Excel
            </button>
          </div>
        )}
      </div>

      {/* Modal de Anulación de Venta */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                ¿Anular esta venta?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                La venta se eliminará del registro y las unidades vendidas se devolverán automáticamente al stock del producto.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminarVenta(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Sí, anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
