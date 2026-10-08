import React, { useState, useEffect, useMemo } from 'react';
import { Producto, Venta, Respaldo } from './types';
import {
  getStoredProductos,
  getStoredVentas,
  getStoredRespaldos,
  saveRespaldos,
  uid,
  fmt,
  fechaHora,
  inicioDelDia,
  UMBRAL_STOCK_BAJO,
  MAX_RESPALDOS,
} from './utils/storage';
import { exportarExcelVentas } from './utils/excelExport';

import HeaderLogo from './components/HeaderLogo';
import ProductosTab from './components/tabs/ProductosTab';
import NuevaVentaTab from './components/tabs/NuevaVentaTab';
import VentasHoyTab from './components/tabs/VentasHoyTab';
import ReportesTab from './components/tabs/ReportesTab';

import AlertasModal from './components/modals/AlertasModal';
import TopMesModal from './components/modals/TopMesModal';
import CompararMesesModal from './components/modals/CompararMesesModal';
import RespaldosModal from './components/modals/RespaldosModal';

import {
  Boxes,
  CreditCard,
  Calendar,
  BarChart3,
  Bell,
  Trophy,
  BarChart2,
  Moon,
  Sun,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface ToastItem {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function App() {
  // Main data states
  const [productos, setProductos] = useState<Producto[]>(getStoredProductos);
  const [ventas, setVentas] = useState<Venta[]>(getStoredVentas);
  const [respaldos, setRespaldos] = useState<Respaldo[]>(getStoredRespaldos);

  // UI states
  const [activeTab, setActiveTab] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('esp_darkmode') === '1';
  });

  // Modals
  const [alertasOpen, setAlertasOpen] = useState(false);
  const [topMesOpen, setTopMesOpen] = useState(false);
  const [compararMesesOpen, setCompararMesesOpen] = useState(false);
  const [respaldosOpen, setRespaldosOpen] = useState(false);

  // Printable HTML state
  const [printHtml, setPrintHtml] = useState<string>('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    dur = 3500
  ) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, dur);
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem('esp_darkmode', '1');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('esp_darkmode', '0');
    }
  }, [darkMode]);

  // Persist data helper
  const guardarDatos = (
    nuevosProds: Producto[],
    nuevasVentas: Venta[],
    generarRespaldoAuto = true
  ) => {
    setProductos(nuevosProds);
    setVentas(nuevasVentas);
    localStorage.setItem('esp_productos', JSON.stringify(nuevosProds));
    localStorage.setItem('esp_ventas', JSON.stringify(nuevasVentas));

    if (generarRespaldoAuto) {
      const nuevoRespaldo: Respaldo = {
        id: uid(),
        fecha: Date.now(),
        productos: JSON.parse(JSON.stringify(nuevosProds)),
        ventas: JSON.parse(JSON.stringify(nuevasVentas)),
        resumen: {
          numProductos: nuevosProds.length,
          numVentas: nuevasVentas.length,
          totalVentas: nuevasVentas.reduce((s, v) => s + v.importe, 0),
        },
      };

      setRespaldos((prev) => {
        const actualizados = [...prev, nuevoRespaldo];
        while (actualizados.length > MAX_RESPALDOS) actualizados.shift();
        saveRespaldos(actualizados);
        return actualizados;
      });
    }
  };

  // Stock alerts count
  const productosBajos = useMemo(() => {
    return productos.filter((p) => p.stock <= UMBRAL_STOCK_BAJO);
  }, [productos]);

  // Clientes recientes para autocompletado
  const clientesRecientes = useMemo(() => {
    const set = new Set(
      ventas.map((v) => v.cliente).filter((c) => c && c.trim() && c !== 'Cliente general')
    );
    return Array.from(set);
  }, [ventas]);

  // Tipos disponibles en el catálogo
  const tiposDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => p.tipo && set.add(p.tipo));
    ventas.forEach((v) => v.tipo && set.add(v.tipo));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [productos, ventas]);

  // Ventas de hoy
  const ventasHoy = useMemo(() => {
    const inicioTs = inicioDelDia().getTime();
    return ventas.filter((v) => v.ts >= inicioTs).sort((a, b) => b.ts - a.ts);
  }, [ventas]);

  // Manejo de Productos
  const handleAgregarOEditar = (p: Omit<Producto, 'id'>, editId?: string) => {
    if (editId) {
      const nuevos = productos.map((item) =>
        item.id === editId ? { ...p, id: editId } : item
      );
      guardarDatos(nuevos, ventas);
      addToast(`Producto "${p.nombre}" actualizado`, 'success');
    } else {
      const nuevo: Producto = { ...p, id: uid() };
      const nuevos = [...productos, nuevo];
      guardarDatos(nuevos, ventas);
      addToast(`"${p.nombre}" agregado al inventario`, 'success');
    }
  };

  const handleAgregarStock = (id: string, cantidad: number) => {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    const nuevos = productos.map((p) =>
      p.id === id ? { ...p, stock: p.stock + cantidad } : p
    );
    guardarDatos(nuevos, ventas);
    addToast(`+${cantidad} unidades agregadas a "${prod.nombre}"`, 'success');
  };

  const handleEliminarProducto = (id: string) => {
    const prod = productos.find((p) => p.id === id);
    const nuevos = productos.filter((p) => p.id !== id);
    guardarDatos(nuevos, ventas);
    addToast(`Producto "${prod?.nombre || ''}" eliminado`, 'warning');
  };

  // Manejo de Ventas
  const handleRegistrarVenta = ({
    productoId,
    cantidad,
    cliente,
  }: {
    productoId: string;
    cantidad: number;
    cliente: string;
  }) => {
    const prod = productos.find((p) => p.id === productoId);
    if (!prod) return;

    const importe = prod.precio * cantidad;
    const ganancia = (prod.precio - prod.costo) * cantidad;
    const nuevoStock = prod.stock - cantidad;

    const nuevaVenta: Venta = {
      id: uid(),
      ts: Date.now(),
      productoId: prod.id,
      producto: prod.nombre,
      tipo: prod.tipo,
      cliente,
      cantidad,
      precio: prod.precio,
      costo: prod.costo,
      importe,
      ganancia,
    };

    const nuevosProds = productos.map((p) =>
      p.id === productoId ? { ...p, stock: nuevoStock } : p
    );

    const nuevasVentas = [...ventas, nuevaVenta];
    guardarDatos(nuevosProds, nuevasVentas);

    addToast(`Venta registrada: ${prod.nombre} ×${cantidad} = ${fmt(importe)}`, 'success');

    if (nuevoStock === 0) {
      setTimeout(() => {
        addToast(`🚫 "${prod.nombre}" ha quedado AGOTADO en almacén`, 'error', 6000);
      }, 500);
    } else if (nuevoStock <= UMBRAL_STOCK_BAJO) {
      setTimeout(() => {
        addToast(`⚠️ "${prod.nombre}" tiene solo ${nuevoStock} unidades restantes`, 'warning', 6000);
      }, 500);
    }
  };

  const handleEliminarVenta = (id: string) => {
    const venta = ventas.find((v) => v.id === id);
    if (!venta) return;

    // Reponer stock
    const nuevosProds = productos.map((p) =>
      p.id === venta.productoId ? { ...p, stock: p.stock + venta.cantidad } : p
    );
    const nuevasVentas = ventas.filter((v) => v.id !== id);

    guardarDatos(nuevosProds, nuevasVentas);
    addToast(`Venta anulada. Se repusieron ${venta.cantidad} unidades al inventario`, 'warning');
  };

  // Respaldos
  const handleCrearRespaldoManual = () => {
    const nuevoRespaldo: Respaldo = {
      id: uid(),
      fecha: Date.now(),
      productos: JSON.parse(JSON.stringify(productos)),
      ventas: JSON.parse(JSON.stringify(ventas)),
      resumen: {
        numProductos: productos.length,
        numVentas: ventas.length,
        totalVentas: ventas.reduce((s, v) => s + v.importe, 0),
      },
    };

    const actualizados = [...respaldos, nuevoRespaldo];
    while (actualizados.length > MAX_RESPALDOS) actualizados.shift();
    setRespaldos(actualizados);
    saveRespaldos(actualizados);
    addToast('Punto de respaldo manual creado', 'success');
  };

  const handleRestaurarRespaldo = (respaldo: Respaldo) => {
    guardarDatos(respaldo.productos, respaldo.ventas, true);
    setRespaldosOpen(false);
    addToast('Sistema restaurado correctamente desde el respaldo', 'success');
  };

  const handleRestaurarDesdeArchivo = (data: { productos: Producto[]; ventas: Venta[] }) => {
    guardarDatos(data.productos, data.ventas, true);
    setRespaldosOpen(false);
    addToast('Datos cargados exitosamente desde archivo JSON', 'success');
  };

  // Exportar Excel
  const handleExportarExcelHoy = async () => {
    if (ventasHoy.length === 0) {
      addToast('No hay ventas hoy para exportar', 'warning');
      return;
    }
    const fecha = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    try {
      await exportarExcelVentas(
        [...ventasHoy].reverse(),
        `ventas_hoy_${new Date().toISOString().slice(0, 10)}`,
        `Reporte del Día — ${fecha}`
      );
      addToast('Archivo Excel descargado exitosamente', 'success');
    } catch (e: any) {
      addToast(`Error al exportar: ${e.message}`, 'error');
    }
  };

  const handleExportarExcelReporte = async (
    ventasExportar: Venta[],
    etiquetaReporte: string
  ) => {
    if (ventasExportar.length === 0) {
      addToast('No hay ventas para exportar', 'warning');
      return;
    }
    try {
      await exportarExcelVentas(
        [...ventasExportar].reverse(),
        `reporte_ventas_${new Date().toISOString().slice(0, 10)}`,
        etiquetaReporte
      );
      addToast('Reporte Excel descargado exitosamente', 'success');
    } catch (e: any) {
      addToast(`Error al exportar: ${e.message}`, 'error');
    }
  };

  // Impresión y generación de PDF B/N
  const handleImprimir = (ventasPrint: Venta[], etiqueta: string) => {
    if (ventasPrint.length === 0) {
      addToast('No hay ventas para imprimir', 'warning');
      return;
    }

    const importe = ventasPrint.reduce((s, v) => s + v.importe, 0);
    const ganancia = ventasPrint.reduce((s, v) => s + v.ganancia, 0);
    const unidades = ventasPrint.reduce((s, v) => s + v.cantidad, 0);

    const filasHtml = ventasPrint
      .map(
        (v) => `
      <tr>
        <td>${fechaHora(v.ts)}</td>
        <td>${v.producto}</td>
        <td>${v.tipo}</td>
        <td>${v.cliente}</td>
        <td style="text-align:center">${v.cantidad}</td>
        <td style="text-align:right">${fmt(v.precio)}</td>
        <td style="text-align:right">${fmt(v.importe)}</td>
        <td style="text-align:right">${fmt(v.ganancia)}</td>
      </tr>`
      )
      .join('');

    const html = `
      <div>
        <h2 style="font-size:20px; font-weight:800; margin-bottom:4px;">REFLEJOS FRAGA — ESPEJOS DE CALIDAD</h2>
        <p style="font-size:12px; margin:0 0 12px 0;"><b>${etiqueta}</b><br/>Generado el: ${new Date().toLocaleString('es-ES')}</p>
        
        <div class="rep-tot">
          <div style="font-size:12px; font-weight:bold;">TOTAL DEL PERÍODO</div>
          <div style="font-size:26px; font-weight:900;">${fmt(importe)}</div>
          <div style="font-size:12px;">Ganancia neta: <b>${fmt(ganancia)}</b> · ${ventasPrint.length} ventas · ${unidades} unidades</div>
        </div>

        <h3 style="font-size:14px; font-weight:bold; margin-top:16px;">Detalle de Transacciones</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Importe</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            ${filasHtml}
          </tbody>
        </table>
        <p style="font-size:10px; text-align:center; margin-top:20px;">Comprobante administrativo · Reflejos Fraga</p>
      </div>
    `;

    setPrintHtml(html);
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Encabezado con Logo Oficial */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950">
        <HeaderLogo />
      </header>

      {/* Barra de Navegación de Pestañas y Herramientas */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto py-2">
          {/* Tabs principales a la izquierda */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveTab(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 1
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Productos</span>
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 2
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Nueva Venta</span>
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 3
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Ventas de Hoy</span>
            </button>

            <button
              onClick={() => setActiveTab(4)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 4
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Reportes</span>
            </button>
          </div>

          {/* Botones de acción directos a la derecha */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {/* Botón de Alertas de Stock */}
            <button
              onClick={() => setAlertasOpen(true)}
              className={`relative p-2.5 rounded-xl border transition ${
                productosBajos.length > 0
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-transparent shadow-md shadow-red-500/30 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Alertas de stock"
            >
              <Bell className="w-4 h-4" />
              {productosBajos.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white border-2 border-white dark:border-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {productosBajos.length > 99 ? '99+' : productosBajos.length}
                </span>
              )}
            </button>

            {/* Botón Top del Mes */}
            <button
              onClick={() => setTopMesOpen(true)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-md shadow-amber-500/25 transition"
              title="Top productos del mes"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Botón Comparar Meses */}
            <button
              onClick={() => setCompararMesesOpen(true)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition"
              title="Comparar 12 meses del año"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Botón Modo Oscuro / Claro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Alternar tema oscuro/claro"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Botón Respaldos */}
            <button
              onClick={() => setRespaldosOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Respaldos y copias de seguridad"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 1 && (
          <ProductosTab
            productos={productos}
            onAgregarOEditar={handleAgregarOEditar}
            onAgregarStock={handleAgregarStock}
            onEliminarProducto={handleEliminarProducto}
          />
        )}

        {activeTab === 2 && (
          <NuevaVentaTab
            productos={productos}
            clientesRecientes={clientesRecientes}
            onRegistrarVenta={handleRegistrarVenta}
          />
        )}

        {activeTab === 3 && (
          <VentasHoyTab
            ventasHoy={ventasHoy}
            onEliminarVenta={handleEliminarVenta}
            onExportarExcel={handleExportarExcelHoy}
            onImprimir={() => {
              const f = new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              handleImprimir([...ventasHoy].reverse(), `Reporte del Día — ${f}`);
            }}
          />
        )}

        {activeTab === 4 && (
          <ReportesTab
            ventas={ventas}
            tiposDisponibles={tiposDisponibles}
            onExportarExcel={handleExportarExcelReporte}
            onImprimir={handleImprimir}
          />
        )}
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-500">
        <p>Reflejos Fraga — Espejos de Calidad · Sistema de Gestión de Inventario y Ventas</p>
      </footer>

      {/* Modales del Sistema */}
      <AlertasModal
        productos={productos}
        isOpen={alertasOpen}
        onClose={() => setAlertasOpen(false)}
        onReponerStock={(id) => {
          setAlertasOpen(false);
          setActiveTab(1);
          handleAgregarStock(id, 5);
        }}
      />

      <TopMesModal
        ventas={ventas}
        isOpen={topMesOpen}
        onClose={() => setTopMesOpen(false)}
      />

      <CompararMesesModal
        ventas={ventas}
        isOpen={compararMesesOpen}
        onClose={() => setCompararMesesOpen(false)}
      />

      <RespaldosModal
        respaldos={respaldos}
        productos={productos}
        ventas={ventas}
        isOpen={respaldosOpen}
        onClose={() => setRespaldosOpen(false)}
        onCrearRespaldoManual={handleCrearRespaldoManual}
        onRestaurarRespaldo={handleRestaurarRespaldo}
        onRestaurarDesdeArchivo={handleRestaurarDesdeArchivo}
      />

      {/* Notificaciones Toast Flotantes */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl shadow-xl text-xs font-semibold border backdrop-blur-md animate-in slide-in-from-right duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : t.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                : t.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/90 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-indigo-500 shrink-0" />}
            <span className="flex-1">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Contenedor Oculto para Impresión B/N */}
      <div
        id="areaImprimir"
        dangerouslySetInnerHTML={{ __html: printHtml }}
        className="hidden"
      />
    </div>
  );
}
