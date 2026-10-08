import React, { useRef } from 'react';
import { Producto, Venta, Respaldo } from '../../types';
import { fmt, MAX_RESPALDOS } from '../../utils/storage';
import { RefreshCw, Download, Upload, Plus, History, RotateCcw, X, Star } from 'lucide-react';

interface RespaldosModalProps {
  respaldos: Respaldo[];
  productos: Producto[];
  ventas: Venta[];
  isOpen: boolean;
  onClose: () => void;
  onCrearRespaldoManual: () => void;
  onRestaurarRespaldo: (respaldo: Respaldo) => void;
  onRestaurarDesdeArchivo: (data: { productos: Producto[]; ventas: Venta[] }) => void;
}

export default function RespaldosModal({
  respaldos,
  productos,
  ventas,
  isOpen,
  onClose,
  onCrearRespaldoManual,
  onRestaurarRespaldo,
  onRestaurarDesdeArchivo,
}: RespaldosModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const descargarRespaldoJSON = () => {
    const data = {
      negocio: 'Reflejos Fraga',
      version: '1.0.0',
      exportado: new Date().toISOString(),
      productos,
      ventas,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `respaldo_reflejos_fraga_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.productos) || !Array.isArray(parsed.ventas)) {
          throw new Error('Formato inválido');
        }
        onRestaurarDesdeArchivo({
          productos: parsed.productos,
          ventas: parsed.ventas,
        });
      } catch (err) {
        alert('El archivo seleccionado no es un respaldo válido de Reflejos Fraga.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Respaldos del Sistema
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Se conservan los últimos {MAX_RESPALDOS} respaldos automáticos
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

        {/* Acciones principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onCrearRespaldoManual}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Crear Respaldo
          </button>

          <button
            onClick={descargarRespaldoJSON}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Descargar JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            <Upload className="w-4 h-4" />
            Subir Archivo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Historial de respaldos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <History className="w-4 h-4 text-indigo-500" />
              Historial ({respaldos.length} / {MAX_RESPALDOS})
            </span>
          </div>

          {respaldos.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aún no hay puntos de respaldo guardados.
            </div>
          ) : (
            <div className="space-y-2">
              {respaldos
                .slice()
                .reverse()
                .map((r, i) => {
                  const idx = respaldos.length - i;
                  const esReciente = i === 0;
                  const fechaTxt = new Date(r.fecha).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        esReciente
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            esReciente
                              ? 'bg-emerald-500 text-white'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {esReciente ? <Star className="w-4 h-4 fill-white" /> : `#${idx}`}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {fechaTxt}
                            {esReciente && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                Más reciente
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {r.resumen.numProductos} productos · {r.resumen.numVentas} ventas · Total {fmt(r.resumen.totalVentas)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRestaurarRespaldo(r)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shrink-0 ml-2 transition"
                        title="Restaurar este punto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
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
