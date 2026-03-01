import jsPDF from 'jspdf'
import 'jspdf-autotable'

const PRIMARY = [126, 34, 206]
const GRAY = [107, 114, 128]
const DARK = [17, 24, 39]
const fmt = (v) => `$ ${Number(v || 0).toLocaleString('es-CO')}`

export function exportReportPDF(tab, data) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const w = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, w, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Zynkia', 15, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const titles = { general: 'Reporte General', nomina: 'Reporte de Nomina', asistencia: 'Reporte de Asistencia', solicitudes: 'Reporte de Solicitudes' }
  doc.text(titles[tab] || 'Reporte', 15, 20)
  doc.text(new Date().toLocaleDateString('es-CO'), w - 15, 13, { align: 'right' })

  let y = 38

  if (tab === 'general') {
    const d = data.dash || {}
    doc.autoTable({
      startY: y, margin: { left: 15, right: 15 },
      head: [['Metrica', 'Valor']],
      body: [
        ['Empleados Activos', String(d.totalEmployees || 0)],
        ['Presentes Hoy', String(d.activeToday || 0)],
        ['Nomina Mensual', fmt(d.monthlyPayroll || 0)],
        ['Solicitudes Pendientes', String(d.pendingRequests || 0)],
      ],
      headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })
  } else if (tab === 'nomina') {
    const p = data.pay || {}
    doc.autoTable({
      startY: y, margin: { left: 15, right: 15 },
      head: [['Concepto', 'Valor']],
      body: [
        ['Nomina Bruta', fmt(p.gross || 0)],
        ['Deducciones', fmt(p.deductions || 0)],
        ['Nomina Neta', fmt(p.net || 0)],
      ],
      headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })
  } else if (tab === 'asistencia') {
    const a = data.att || {}
    doc.autoTable({
      startY: y, margin: { left: 15, right: 15 },
      head: [['Metrica', 'Valor']],
      body: [
        ['Asistencia Promedio', `${a.avgRate || 0}%`],
        ['Tardanzas', String(a.lateCount || 0)],
        ['Ausencias', String(a.absentCount || 0)],
      ],
      headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })
  } else if (tab === 'solicitudes') {
    const r = data.req || {}
    doc.autoTable({
      startY: y, margin: { left: 15, right: 15 },
      head: [['Estado', 'Cantidad']],
      body: [
        ['Total', String(r.total || 0)],
        ['Aprobadas', String(r.approved || 0)],
        ['Rechazadas', String(r.rejected || 0)],
        ['Pendientes', String(r.pending || 0)],
      ],
      headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight()
  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.text(`Zynkia — Generado el ${new Date().toLocaleString('es-CO')}`, 15, pageH - 10)

  doc.save(`reporte_${tab}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function exportReportCSV(tab, data) {
  let rows = []
  if (tab === 'general') {
    const d = data.dash || {}
    rows = [['Metrica', 'Valor'], ['Empleados Activos', d.totalEmployees || 0], ['Presentes Hoy', d.activeToday || 0], ['Nomina Mensual', d.monthlyPayroll || 0], ['Solicitudes Pendientes', d.pendingRequests || 0]]
  } else if (tab === 'nomina') {
    const p = data.pay || {}
    rows = [['Concepto', 'Valor'], ['Nomina Bruta', p.gross || 0], ['Deducciones', p.deductions || 0], ['Nomina Neta', p.net || 0]]
  } else if (tab === 'asistencia') {
    const a = data.att || {}
    rows = [['Metrica', 'Valor'], ['Asistencia Promedio', `${a.avgRate || 0}%`], ['Tardanzas', a.lateCount || 0], ['Ausencias', a.absentCount || 0]]
  } else if (tab === 'solicitudes') {
    const r = data.req || {}
    rows = [['Estado', 'Cantidad'], ['Total', r.total || 0], ['Aprobadas', r.approved || 0], ['Rechazadas', r.rejected || 0], ['Pendientes', r.pending || 0]]
  }
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `reporte_${tab}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}
