import ExcelJS from 'exceljs';
import { Venta } from '../types';

export async function exportarExcelVentas(
  ventas: Venta[],
  nombreArchivo: string,
  etiquetaReporte: string
): Promise<void> {
  if (ventas.length === 0) {
    throw new Error('No hay ventas para exportar');
  }

  const importe = ventas.reduce((s, v) => s + v.importe, 0);
  const ganancia = ventas.reduce((s, v) => s + v.ganancia, 0);
  const unidades = ventas.reduce((s, v) => s + v.cantidad, 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Reflejos Fraga';
  wb.created = new Date();

  const ws = wb.addWorksheet('Ventas', {
    views: [{ state: 'frozen', ySplit: 11 }],
  });

  ws.columns = [
    { width: 13 }, // Fecha
    { width: 9 },  // Hora
    { width: 36 }, // Producto
    { width: 16 }, // Tipo
    { width: 24 }, // Cliente
    { width: 10 }, // Cantidad
    { width: 14 }, // Precio Unit.
    { width: 14 }, // Costo Unit.
    { width: 14 }, // Importe
    { width: 14 }, // Ganancia
  ];

  // Fila 1: Título Empresa
  ws.mergeCells('A1:J1');
  const c1 = ws.getCell('A1');
  c1.value = 'REFLEJOS FRAGA - ESPEJOS DE CALIDAD';
  c1.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF4F46E5' } };
  c1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 32;

  // Fila 2: Etiqueta Período
  ws.mergeCells('A2:J2');
  const c2 = ws.getCell('A2');
  c2.value = etiquetaReporte;
  c2.font = { size: 12, color: { argb: 'FF64748B' }, bold: true };
  c2.alignment = { horizontal: 'center', vertical: 'middle' };

  // Fila 3: Fecha Generación
  ws.mergeCells('A3:J3');
  const c3 = ws.getCell('A3');
  c3.value = 'Generado el ' + new Date().toLocaleString('es-ES');
  c3.font = { size: 10, italic: true, color: { argb: 'FF94A3B8' } };
  c3.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getRow(4).height = 8;

  // Fila 5: Cabecera Resumen
  ws.mergeCells('A5:J5');
  const c5 = ws.getCell('A5');
  c5.value = 'RESUMEN EJECUTIVO';
  c5.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  c5.alignment = { horizontal: 'left', vertical: 'middle' };
  c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  ws.getRow(5).height = 22;

  // Filas 6-9: Tarjetas resumen
  const resumenFilas = [
    ['Total Vendido', importe, 'FF065F46'],
    ['Ganancia Neta', ganancia, 'FF6D28D9'],
    ['Número de Ventas', ventas.length, 'FF1E293B'],
    ['Unidades Vendidas', unidades, 'FF1E293B'],
  ];

  resumenFilas.forEach((fila, i) => {
    const r = 6 + i;
    ws.mergeCells(`A${r}:D${r}`);
    ws.mergeCells(`E${r}:J${r}`);
    const cA = ws.getCell(`A${r}`);
    const cE = ws.getCell(`E${r}`);

    cA.value = fila[0];
    cA.font = { bold: true, color: { argb: 'FF475569' } };
    cA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    cA.alignment = { vertical: 'middle', indent: 1 };

    cE.value = fila[1];
    cE.font = { bold: true, size: 12, color: { argb: fila[2] as string } };
    cE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    cE.alignment = { vertical: 'middle', horizontal: 'right' };

    if (i < 2) cE.numFmt = '"$"#,##0.00';

    [cA, cE].forEach((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: 'FF10B981' } },
        bottom: { style: 'thin', color: { argb: 'FF10B981' } },
        left: { style: 'thin', color: { argb: 'FF10B981' } },
        right: { style: 'thin', color: { argb: 'FF10B981' } },
      };
    });
  });

  ws.getRow(10).height = 8;

  // Fila 11: Encabezados de tabla
  const encabezados = [
    'Fecha',
    'Hora',
    'Producto',
    'Tipo',
    'Cliente',
    'Cantidad',
    'Precio Unit.',
    'Costo Unit.',
    'Importe',
    'Ganancia',
  ];

  const headerRow = ws.getRow(11);
  encabezados.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF4F46E5' } },
      bottom: { style: 'thin', color: { argb: 'FF4F46E5' } },
      left: { style: 'thin', color: { argb: 'FF4F46E5' } },
      right: { style: 'thin', color: { argb: 'FF4F46E5' } },
    };
  });
  headerRow.height = 24;

  // Filas de datos
  ventas.forEach((v, idx) => {
    const r = 12 + idx;
    const d = new Date(v.ts);
    const row = ws.getRow(r);

    row.values = [
      d.toLocaleDateString('es-ES'),
      d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      v.producto,
      v.tipo,
      v.cliente,
      v.cantidad,
      v.precio,
      v.costo,
      v.importe,
      v.ganancia,
    ];

    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };
    row.getCell(7).numFmt = '"$"#,##0.00';
    row.getCell(8).numFmt = '"$"#,##0.00';
    row.getCell(9).numFmt = '"$"#,##0.00';
    row.getCell(9).font = { bold: true, color: { argb: 'FF4F46E5' } };
    row.getCell(10).numFmt = '"$"#,##0.00';
    row.getCell(10).font = { bold: true, color: { argb: 'FF059669' } };

    for (let col = 1; col <= 10; col++) {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (idx % 2 === 1) {
        row.getCell(col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    }
  });

  // Fila de Totales
  const totalRowNum = 12 + ventas.length;
  ws.mergeCells(`A${totalRowNum}:H${totalRowNum}`);
  const cT = ws.getCell(`A${totalRowNum}`);
  cT.value = 'TOTALES:';
  cT.font = { bold: true, size: 12, color: { argb: 'FF1E293B' } };
  cT.alignment = { horizontal: 'right', vertical: 'middle' };
  cT.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cT.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };

  const cI = ws.getCell(`I${totalRowNum}`);
  cI.value = importe;
  cI.font = { bold: true, size: 12, color: { argb: 'FF065F46' } };
  cI.numFmt = '"$"#,##0.00';
  cI.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  cI.alignment = { horizontal: 'right' };
  cI.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };

  const cJ = ws.getCell(`J${totalRowNum}`);
  cJ.value = ganancia;
  cJ.font = { bold: true, size: 12, color: { argb: 'FF059669' } };
  cJ.numFmt = '"$"#,##0.00';
  cJ.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  cJ.alignment = { horizontal: 'right' };
  cJ.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };

  ws.getRow(totalRowNum).height = 26;

  // Descarga del archivo
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo + '.xlsx';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
