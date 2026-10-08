import React from 'react';
import { Venta } from '../../types';
import { fmt } from '../../utils/storage';
import { BarChart3, X, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface CompararMesesModalProps {
  ventas: Venta[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CompararMesesModal({
  ventas,
  isOpen,
  onClose,
}: CompararMesesModalProps) {
  if (!isOpen) return null;

  const ahora = new Date();
  const yearActual = ahora.getFullYear();
  const mesActualIdx = ahora.getMonth();

  const nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const meses = [];
  for (let m = 0; m < 12; m++) {
    const inicio = new Date(yearActual, m, 1, 0, 0, 0, 0);
    const fin = new Date(yearActual, m + 1, 0, 23, 59, 59, 999);
    const ventasMes = ventas.filter((v) => v.ts >= inicio.getTime() && v.ts <= fin.getTime());
    const importe = ventasMes.reduce((s, v) => s + v.importe, 0);
    const ganancia = ventasMes.reduce((s, v) => s + v.ganancia, 0);
    const unidades = ventasMes.reduce((s, v) => s + v.cantidad, 0);

    meses.push({
      mes: m,
      etiqueta: nombresMeses[m],
      importe,
      ganancia,
      unidades,
      numVentas: ventasMes.length,
      esActual: m === mesActualIdx,
      esFuturo: m > mesActualIdx,
    });
  }

  const mesAct = meses[mesActualIdx];
  const mesAnt = mesActualIdx > 0 ? meses[mesActualIdx - 1] : { importe: 0, ganancia: 0 };
  const totalAnio = meses.reduce((s, m) => s + m.importe, 0);
  const gananciaAnio = meses.reduce((s, m) => s + m.ganancia, 0);
  const unidadesAnio = meses.reduce((s, m) => s + m.unidades, 0);

  const maxImporte = Math.max(...meses.map((m) => m.importe), 1);

  const difImporte = mesAct.importe - mesAnt.importe;
  const pctImporte =
    mesAnt.importe > 0
      ? (difImporte / mesAnt.importe) * 100
      : mesAct.importe > 0
      ? 100
      : 0;

  const difGanancia = mesAct.ganancia - mesAnt.ganancia;
  const pctGanancia =
    mesAnt.ganancia > 0
      ? (difGanancia / mesAnt.ganancia) * 100
      : mesAct.ganancia > 0
      ? 100
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Comparar Meses del Año
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vista anual {yearActual} · 12 meses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPIs Comparativa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mes actual
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
              {fmt(mesAct.importe)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
              {pctImporte > 0.5 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +{pctImporte.toFixed(1)}%
                </span>
              ) : pctImporte < -0.5 ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> {pctImporte.toFixed(1)}%
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Minus className="w-3 h-3" /> 0%
                </span>
              )}
              <span className="text-[10px] text-slate-400">vs anterior</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ganancia mes
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {fmt(mesAct.ganancia)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
              {pctGanancia > 0.5 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +{pctGanancia.toFixed(1)}%
                </span>
              ) : pctGanancia < -0.5 ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> {pctGanancia.toFixed(1)}%
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Minus className="w-3 h-3" /> 0%
                </span>
              )}
              <span className="text-[10px] text-slate-400">vs anterior</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total año
            </div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {fmt(totalAnio)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {unidadesAnio} unidades
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ganancia año
            </div>
            <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">
              {fmt(gananciaAnio)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Año {yearActual}
            </div>
          </div>
        </div>

        {/* Lista de Meses con Barras */}
        <div className="space-y-2 pt-1">
          {meses.map((m) => {
            const porcentaje = ((m.importe / maxImporte) * 100).toFixed(1);
            if (m.esFuturo) {
              return (
                <div
                  key={m.mes}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 opacity-40"
                >
                  <div className="w-24 text-xs font-semibold text-slate-400">
                    {m.etiqueta}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <div className="h-full bg-slate-300 dark:bg-slate-700 w-0"></div>
                  </div>
                  <div className="w-28 text-right text-xs text-slate-400">
                    — sin datos
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.mes}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                  m.esActual
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700/60 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`w-24 text-xs font-bold ${m.esActual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {m.etiqueta}
                  {m.esActual && <span className="ml-1 text-[10px] text-indigo-500 font-bold">●</span>}
                </div>

                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-700 ${
                      m.esActual
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{ width: `${Math.max(Number(porcentaje), m.importe > 0 ? 3 : 0)}%` }}
                  ></div>
                </div>

                <div className="w-28 text-right shrink-0">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {fmt(m.importe)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {m.unidades} unid.
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
