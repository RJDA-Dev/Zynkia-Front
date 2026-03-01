import jsPDF from 'jspdf'
import 'jspdf-autotable'

const PRIMARY = [126, 34, 206] // #7e22ce
const GRAY = [107, 114, 128]
const DARK = [17, 24, 39]
const LIGHT_BG = [249, 250, 251]

const fmt = (v) => `$ ${Number(v || 0).toLocaleString('es-CO')}`

export function generatePaystub(item, period, companyName = 'Zynkia') {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const w = doc.internal.pageSize.getWidth()
  const emp = item.employee || {}

  // Header bar
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, w, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(companyName, 15, 15)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de Nómina / Pay Stub', 15, 22)
  doc.text(`Período: ${period}`, w - 15, 15, { align: 'right' })
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, w - 15, 22, { align: 'right' })

  // Employee info
  let y = 42
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Información del Empleado', 15, y)
  y += 8

  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(15, y - 4, w - 30, 28, 3, 3, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  const info = [
    ['Nombre', emp.name || '-'],
    ['Cargo', emp.position || emp.roleTitle || '-'],
    ['Departamento', emp.department?.name || '-'],
    ['ID Empleado', item.employeeId?.slice(0, 8) || '-'],
  ]
  const colW = (w - 30) / 2
  info.forEach((pair, i) => {
    const x = 20 + (i % 2) * colW
    const row = Math.floor(i / 2) * 12
    doc.setTextColor(...GRAY)
    doc.text(pair[0], x, y + 3 + row)
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.text(pair[1], x, y + 8 + row)
    doc.setFont('helvetica', 'normal')
  })

  y += 34

  // Earnings table
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Devengados', 15, y)
  y += 3

  const base = Number(item.baseSalary || 0)
  const transport = Number(item.transportAllowance || 0)
  const overtime = Number(item.overtimeAmount || 0)
  const bonuses = Number(item.bonuses || 0)
  const gross = Number(item.gross || 0)

  doc.autoTable({
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Concepto', 'Valor']],
    body: [
      ['Salario Base', fmt(base)],
      ['Auxilio de Transporte', fmt(transport)],
      ['Horas Extra', fmt(overtime)],
      ['Bonificaciones', fmt(bonuses)],
    ],
    foot: [['Total Devengado', fmt(gross)]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [243, 232, 255], textColor: PRIMARY, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: { 1: { halign: 'right' } },
  })

  y = doc.lastAutoTable.finalY + 8

  // Deductions table
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Deducciones', 15, y)
  y += 3

  const health = Number(item.health || 0)
  const pension = Number(item.pension || 0)
  const tax = Number(item.tax || 0)
  const deductions = Number(item.deductions || 0)
  const totalDed = health + pension + tax + deductions

  doc.autoTable({
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Concepto', 'Valor']],
    body: [
      ['Salud (4%)', fmt(health)],
      ['Pensión (4%)', fmt(pension)],
      ['Retención en la Fuente', fmt(tax)],
      ['Otras Deducciones', fmt(deductions)],
    ],
    foot: [['Total Deducciones', fmt(totalDed)]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [254, 226, 226], textColor: [220, 38, 38], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: { 1: { halign: 'right' } },
  })

  y = doc.lastAutoTable.finalY + 10

  // Net pay box
  const net = Number(item.net || 0)
  doc.setFillColor(...PRIMARY)
  doc.roundedRect(15, y, w - 30, 18, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('NETO A PAGAR', 20, y + 7)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(fmt(net), w - 20, y + 12, { align: 'right' })

  // Footer
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(229, 231, 235)
  doc.line(15, pageH - 25, w - 15, pageH - 25)
  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Este documento es un comprobante de nómina generado electrónicamente.', 15, pageH - 18)
  doc.text(`${companyName} — Generado el ${new Date().toLocaleString('es-CO')}`, 15, pageH - 13)

  return doc
}

export function downloadPaystub(item, period) {
  const doc = generatePaystub(item, period)
  const name = (item.employee?.name || 'empleado').replace(/\s+/g, '_')
  doc.save(`nomina_${period}_${name}.pdf`)
}

export function downloadAllPaystubs(items, period) {
  if (!items.length) return
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  items.forEach((item, i) => {
    if (i > 0) doc.addPage()
    renderPaystubPage(doc, item, period)
  })
  doc.save(`nomina_${period}_todos.pdf`)
}

function renderPaystubPage(doc, item, period, companyName = 'Zynkia') {
  const w = doc.internal.pageSize.getWidth()
  const emp = item.employee || {}

  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, w, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(companyName, 15, 13)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${period}`, w - 15, 13, { align: 'right' })
  doc.text(`Comprobante de Nómina`, 15, 20)

  let y = 36
  doc.setTextColor(...DARK)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(emp.name || '-', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(`${emp.position || ''} — ${emp.department?.name || ''}`, 15, y + 5)
  y += 14

  const base = Number(item.baseSalary || 0)
  const transport = Number(item.transportAllowance || 0)
  const overtime = Number(item.overtimeAmount || 0)
  const bonuses = Number(item.bonuses || 0)
  const gross = Number(item.gross || 0)
  const health = Number(item.health || 0)
  const pension = Number(item.pension || 0)
  const tax = Number(item.tax || 0)
  const deductions = Number(item.deductions || 0)
  const net = Number(item.net || 0)

  doc.autoTable({
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Concepto', 'Devengado', 'Deducido']],
    body: [
      ['Salario Base', fmt(base), ''],
      ['Auxilio de Transporte', fmt(transport), ''],
      ['Horas Extra', fmt(overtime), ''],
      ['Bonificaciones', fmt(bonuses), ''],
      ['Salud (4%)', '', fmt(health)],
      ['Pensión (4%)', '', fmt(pension)],
      ['Retención', '', fmt(tax)],
      ['Otras Deducciones', '', fmt(deductions)],
    ],
    foot: [['TOTALES', fmt(gross), fmt(health + pension + tax + deductions)],
           ['NETO A PAGAR', { content: fmt(net), colSpan: 2, styles: { halign: 'right' } }]],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255] },
    footStyles: { fillColor: [243, 232, 255], textColor: PRIMARY, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
  })
}
