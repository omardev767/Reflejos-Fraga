import React, { useState } from 'react';
import { Producto } from '../../types';
import { fmt, normalizar, UMBRAL_STOCK_BAJO, TIPOS_ESPEJO_DEFAULT } from '../../utils/storage';
import {
  PackagePlus,
  Package,
  Search,
  X,
  Edit2,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Save,
} from 'lucide-react';

interface ProductosTabProps {
  productos: Producto[];
  onAgregarOEditar: (p: Omit<Producto, 'id'>, editId?: string) => void;
  onAgregarStock: (id: string, cantidad: number) => void;
  onEliminarProducto: (id: string) => void;
}

export default function ProductosTab({
  productos,
  onAgregarOEditar,
  onAgregarStock,
  onEliminarProducto,
}: ProductosTabProps) {
  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  // Search state
  const [search, setSearch] = useState('');

  // Quick stock modal or prompt state
  const [stockModalProd, setStockModalProd] = useState<Producto | null>(null);
  const [stockCantidad, setStockCantidad] = useState('1');

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const numCosto = parseFloat(costo) || 0;
    const numPrecio = parseFloat(precio) || 0;
    const numStock = parseInt(stock) || 0;

    if (numPrecio <= 0) {
      alert('Ingresa un precio de venta válido.');
      return;
    }

    onAgregarOEditar(
      {
        nombre: nombre.trim(),
        tipo: tipo.trim() || 'Sin especificar',
        costo: numCosto,
        precio: numPrecio,
        stock: numStock,
      },
      editId || undefined
    );

    cancelarEdicion();
  };

  const handleEditar = (p: Producto) => {
    setEditId(p.id);
    setNombre(p.nombre);
    setTipo(p.tipo);
    setCosto(String(p.costo));
    setPrecio(String(p.precio));
    setStock(String(p.stock));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setNombre('');
    setTipo('');
    setCosto('');
    setPrecio('');
    setStock('');
  };

  // KPIs
  const valorCosto = productos.reduce((s, p) => s + p.costo * p.stock, 0);
  const valorVenta = productos.reduce((s, p) => s + p.precio * p.stock, 0);
  const unidadesTotales = productos.reduce((s, p) => s + p.stock, 0);
  const bajosCount = productos.filter((p) => p.stock <= UMBRAL_STOCK_BAJO).length;

  // Filtrado
  const q = normalizar(search);
  const filtrados = q
    ? productos.filter(
        (p) => normalizar(p.nombre).includes(q) || normalizar(p.tipo).includes(q)
      )
    : productos;

  return (
    <div className="space-y-6">
      {/* Formulario de Agregar / Editar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            {editId ? <Edit2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editId ? `Editando: ${nombre || 'Producto'}` : 'Agregar Nuevo Producto'}
            </h2>
            <p className="text-xs text-slate-500">
              Registra las especificaciones, costos y existencias del espejo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Nombre del espejo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Espejo Redondo Biselado 60cm"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Tipo de espejo
              </label>
              <input
                type="text"
                list="tiposList"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ej: Biselado, LED..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <datalist id="tiposList">
                {TIPOS_ESPEJO_DEFAULT.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Costo de compra $
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Precio de venta $
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Stock disponible
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition"
            >
              {editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editId ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>

            {editId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Resumen KPIs de Inventario */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            Variedades
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {productos.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            Unidades
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {unidadesTotales}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            Invertido
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {fmt(valorCosto)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 inset-x-0"></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Valor Venta
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {fmt(valorVenta)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
          <div className={`h-1 absolute top-0 inset-x-0 ${bajosCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${bajosCount > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
            Stock Bajo
          </div>
          <div className={`text-2xl font-black ${bajosCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {bajosCount}
          </div>
        </div>
      </div>

      {/* Buscador y Tabla de Inventario */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Inventario Actual
          </h3>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o tipo..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {search && (
          <div className="text-xs text-slate-500">
            Mostrando <span className="font-bold text-indigo-600 dark:text-indigo-400">{filtrados.length}</span> de {productos.length} productos
          </div>
        )}

        {filtrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Costo</th>
                  <th className="py-3 px-3">Precio</th>
                  <th className="py-3 px-3">Margen</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtrados.map((p) => {
                  const margen = p.precio > 0 ? ((p.precio - p.costo) / p.precio) * 100 : 0;
                  const isAgotado = p.stock === 0;
                  const isBajo = p.stock > 0 && p.stock <= UMBRAL_STOCK_BAJO;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {p.nombre}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/40">
                          {p.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {fmt(p.costo)}
                      </td>
                      <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {fmt(p.precio)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            margen >= 40
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : margen >= 20
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                              : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {margen.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isAgotado
                              ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                              : isBajo
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {isAgotado ? '🚫 Agotado' : isBajo ? `⚠️ ${p.stock}` : `${p.stock} unid.`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditar(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setStockModalProd(p);
                              setStockCantidad('1');
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            title="Agregar stock rápido"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Agregar Stock Rápido */}
      {stockModalProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Agregar Stock
            </h4>
            <p className="text-xs text-slate-500">
              Producto: <b className="text-slate-800 dark:text-slate-200">{stockModalProd.nombre}</b>
              <br />
              Stock actual: <b className="text-indigo-600">{stockModalProd.stock}</b> unidades
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Cantidad a sumar
              </label>
              <input
                type="number"
                min="1"
                value={stockCantidad}
                onChange={(e) => setStockCantidad(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStockModalProd(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const cant = parseInt(stockCantidad);
                  if (cant > 0) {
                    onAgregarStock(stockModalProd.id, cant);
                    setStockModalProd(null);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
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
                ¿Eliminar producto?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción no se puede deshacer. Se removerá del inventario.
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
                  onEliminarProducto(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
