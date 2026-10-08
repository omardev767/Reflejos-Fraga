import React from 'react';
import { Producto } from '../../types';
import { fmt, UMBRAL_STOCK_BAJO } from '../../utils/storage';
import { Bell, AlertTriangle, XCircle, Plus, CheckCircle2, X } from 'lucide-react';

interface AlertasModalProps {
  productos: Producto[];
  isOpen: boolean;
  onClose: () => void;
  onReponerStock: (id: string) => void;
}

export default function AlertasModal({
  productos,
  isOpen,
  onClose,
  onReponerStock,
}: AlertasModalProps) {
  if (!isOpen) return null;

  const bajos = productos
    .filter((p) => p.stock <= UMBRAL_STOCK_BAJO)
    .sort((a, b) => a.stock - b.stock);

  const agotados = bajos.filter((p) => p.stock === 0);
  const criticos = bajos.filter((p) => p.stock > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${bajos.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Alertas de Stock
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Productos con {UMBRAL_STOCK_BAJO} unidades o menos
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

        {bajos.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              ¡Todo en orden con tu inventario!
            </p>
            <p className="text-xs text-slate-500">
              No hay productos con stock bajo o agotado en este momento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  AGOTADOS
                </div>
                <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-1">
                  {agotados.length}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  STOCK BAJO
                </div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                  {criticos.length}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {bajos.map((p) => {
                const isAgotado = p.stock === 0;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isAgotado
                        ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                        : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {p.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.tipo} · Precio: <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(p.precio)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-base font-extrabold ${
                            isAgotado
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {p.stock}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isAgotado ? 'Agotado' : 'unidades'}
                        </div>
                      </div>

                      <button
                        onClick={() => onReponerStock(p.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                        title="Reponer stock"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Reponer
                      </button>
                    </div>
                  </div>
                );
              })}
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
