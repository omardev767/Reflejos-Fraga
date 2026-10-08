import React, { useState, useMemo } from 'react';
import { Venta, RangoTipo } from '../../types';
import {
  fmt,
  normalizar,
  fechaHora,
  inicioDelDia,
  inicioSemana,
  inicioMes,
} from '../../utils/storage';
import {
  BarChart3,
  Search,
  X,
  Printer,
  FileSpreadsheet,
  Filter,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  Receipt,
  Layers,
} from 'lucide-react';

interface ReportesTabProps {
  ventas: Venta[];
  tiposDisponibles: string[];
  onExportarExcel: (ventasFiltradas: Venta[], etiqueta: string) => void;
  onImprimir: (ventasFiltradas: Venta[], etiqueta: string) => void;
}

export default function ReportesTab({
  ventas,
  tiposDisponibles,
  onExportarExcel,
  onImprimir,
}: ReportesTabProps) {
  const [rango, setRango] = useState<RangoTipo>('semana');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [search, setSearch] = useState('');

  // Cálculo del rango de fechas
  const { desdeTs, hastaTs, etiquetaRango } = useMemo(() => {
    const ahora = new Date();
    let desde = new Date();
    let hasta = new Date();
    hasta.setHours(23, 59, 59, 999);
    let etiqueta = '';

    if (rango === 'hoy') {
      desde = inicioDelDia();
      etiqueta = 'Hoy — ' + ahora.toLocaleDateString('es-ES');
    } else if (rango === 'semana') {
      desde = inicioSemana();
      etiqueta = `Semana del ${desde.toLocaleDateString('es-ES')} al ${hasta.toLocaleDateString('es-ES')}`;
    } else if (rango === 'mes') {
      desde = inicioMes();
      etiqueta = ahora.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } else if (rango === 'mesAnterior') {
      desde = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      hasta = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59, 999);
      etiqueta = desde.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } else if (rango === 'todo') {
      desde = new Date(2000, 0, 1);
      etiqueta = 'Todo el Historial';
    } else {
      desde = fechaDesde ? new Date(fechaDesde + 'T00:00:00') : new Date(2000, 0, 1);
      hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : new Date();
      etiqueta = `Del ${desde.toLocaleDateString('es-ES')} al ${hasta.toLocaleDateString('es-ES')}`;
    }

    return {
      desdeTs: desde.getTime(),
      hastaTs: hasta.getTime(),
      etiquetaRango: etiqueta,
    };
  }, [rango, fechaDesde, fechaHasta]);

  // Filtrado de ventas por fecha, tipo y búsqueda
  const ventasEnRango = useMemo(() => {
    return ventas.filter((v) => v.ts >= desdeTs && v.ts <= hastaTs);
  }, [ventas, desdeTs, hastaTs]);

  const q = normalizar(search);
  const ventasFiltradas = useMemo(() => {
    return ventasEnRango.filter((v) => {
      const matchTipo = tipoFiltro ? v.tipo === tipoFiltro : true;
      const matchSearch = q
        ? normalizar(v.producto).includes(q) ||
          normalizar(v.cliente).includes(q) ||
          normalizar(v.tipo).includes(q)
        : true;
      return matchTipo && matchSearch;
    });
  }, [ventasEnRango, tipoFiltro, q]);

  // KPIs del período filtrado
  const totalImporte = ventasFiltradas.reduce((s, v) => s + v.importe, 0);
  const totalGanancia = ventasFiltradas.reduce((s, v) => s + v.ganancia, 0);
  const totalUnidades = ventasFiltradas.reduce((s, v) => s + v.cantidad, 0);
  const ticketPromedio = ventasFiltradas.length > 0 ? totalImporte / ventasFiltradas.length : 0;

  // Gráfico de ventas por día
  const datosPorDia = useMemo(() => {
    const porDia: Record<string, number> = {};
    ventasFiltradas.forEach((v) => {
      const k = new Date(v.ts).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      porDia[k] = (porDia[k] || 0) + v.importe;
    });

    const dias = Object.keys(porDia).slice(-14);
    const maxVal = Math.max(...dias.map((d) => porDia[d]), 1);

    return { dias, porDia, maxVal };
  }, [ventasFiltradas]);

  const etiquetaCompleta = useMemo(() => {
    const extras: string[] = [];
    if (tipoFiltro) extras.push(`Tipo: ${tipoFiltro}`);
    if (search) extras.push(`Búsqueda: "${search}"`);
    return `Reporte ${etiquetaRango}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
  }, [etiquetaRango, tipoFiltro, search]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-500" />
          Filtros de Reporte
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Rango de Tiempo
            </label>
            <select
              value={rango}
              onChange={(e) => setRango(e.target.value as RangoTipo)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="mesAnterior">Mes anterior</option>
              <option value="todo">Todo el historial</option>
              <option value="personalizado">Personalizado…</option>
            </select>
          </div>

          {rango === 'personalizado' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Tipo de espejo
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los tipos</option>
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Búsqueda rápida
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Producto, cliente..."
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs del Período */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            {ventasFiltradas.length}
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

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
            Ticket Prom.
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {fmt(ticketPromedio)}
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas por Día */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Ventas por Día ({datosPorDia.dias.length} días)
        </h3>

        {datosPorDia.dias.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Sin ventas para graficar en este período.
          </div>
        ) : (
          <div className="space-y-2">
            {datosPorDia.dias.map((dia) => {
              const val = datosPorDia.porDia[dia];
              const pct = ((val / datosPorDia.maxVal) * 100).toFixed(1);

              return (
                <div key={dia} className="flex items-center gap-3 text-xs">
                  <div className="w-16 font-mono font-bold text-slate-500 shrink-0">
                    {dia.slice(0, 5)}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg transition-all duration-500"
                      style={{ width: `${Math.max(Number(pct), 3)}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-right font-black text-slate-900 dark:text-slate-100 shrink-0">
                    {fmt(val)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla de Detalle de Ventas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-500" />
          Detalle de Transacciones
        </h3>

        {ventasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No se encontraron ventas para los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Fecha y Hora</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3 text-center">Cant.</th>
                    <th className="py-3 px-3">Precio</th>
                    <th className="py-3 px-3">Importe</th>
                    <th className="py-3 px-3">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {ventasFiltradas
                    .slice()
                    .reverse()
                    .map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {fechaHora(v.ts)}
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
                        <td className="py-3 px-3 font-black text-indigo-600 dark:text-indigo-400">
                          {fmt(v.importe)}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          +{fmt(v.ganancia)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Total Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 text-center space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                TOTAL DEL PERÍODO FILTRADO
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {fmt(totalImporte)}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                Ganancia neta: <b>{fmt(totalGanancia)}</b> · {ventasFiltradas.length} ventas · {totalUnidades} unidades
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onImprimir(ventasFiltradas, etiquetaCompleta)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                Imprimir / PDF (B/N)
              </button>

              <button
                onClick={() => onExportarExcel(ventasFiltradas, etiquetaCompleta)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Exportar a Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
