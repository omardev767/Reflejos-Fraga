import React from 'react';
import { Venta } from '../../types';
import { fmt, inicioMes } from '../../utils/storage';
import { Trophy, X, TrendingUp, DollarSign, Package } from 'lucide-react';

interface TopMesModalProps {
  ventas: Venta[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TopMesModal({ ventas, isOpen, onClose }: TopMesModalProps) {
  if (!isOpen) return null;

  const desde = inicioMes().getTime();
  const arr = ventas.filter((v) => v.ts >= desde);

  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const mesCapital = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

  const porProd: Record<string, { unidades: number; importe: number; ganancia: number; tipo: string }> = {};
  arr.forEach((v) => {
    if (!porProd[v.producto]) {
      porProd[v.producto] = { unidades: 0, importe: 0, ganancia: 0, tipo: v.tipo };
    }
    porProd[v.producto].unidades += v.cantidad;
    porProd[v.producto].importe += v.importe;
    porProd[v.producto].ganancia += v.ganancia;
  });

  const ranking = Object.entries(porProd)
    .sort((a, b) => b[1].importe - a[1].importe)
    .slice(0, 10);

  const medallas = ['🥇', '🥈', '🥉'];
  const totalMes = arr.reduce((s, v) => s + v.importe, 0);
  const gananciaMes = arr.reduce((s, v) => s + v.ganancia, 0);
  const unidadesMes = arr.reduce((s, v) => s + v.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Top Productos del Mes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {mesCapital}
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

        {arr.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Aún no hay ventas registradas este mes
            </p>
            <p className="text-xs text-slate-400">
              Las ventas que registres se clasificarán automáticamente aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  TOTAL MES
                </div>
                <div className="text-lg font-black text-amber-800 dark:text-amber-300 mt-0.5">
                  {fmt(totalMes)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  GANANCIA
                </div>
                <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {fmt(gananciaMes)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  UNIDADES
                </div>
                <div className="text-lg font-black text-indigo-800 dark:text-indigo-300 mt-0.5">
                  {unidadesMes}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {ranking.map(([nombre, d], i) => (
                <div
                  key={nombre}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                    i === 0
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-sm'
                      : i === 1
                      ? 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700'
                      : i === 2
                      ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-2xl w-8 text-center shrink-0 font-black">
                    {medallas[i] || <span className="text-sm text-slate-400 font-bold">#{i + 1}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {nombre}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.tipo} · <span className="font-semibold text-slate-700 dark:text-slate-300">{d.unidades} unidad{d.unidades !== 1 ? 'es' : ''}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {fmt(d.importe)}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +{fmt(d.ganancia)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
