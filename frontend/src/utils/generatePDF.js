import { jsPDF } from 'jspdf'

const PRIMARY = '#3b82f6'
const ACCENT = '#a855f7'
const DARK = '#0f172a'
const SURFACE = '#1e293b'
const TEXT = '#e2e8f0'
const TEXT_MUTED = '#94a3b8'

function toDataURL(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function downloadTripPDF(trip, branding) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  const margin = 18
  const contentW = pw - margin * 2

  const primary = branding?.primaryColor || PRIMARY
  const accent = branding?.accentColor || ACCENT
  const agencyName = branding?.name || 'Travel Agency'
  const tagline = branding?.tagline || ''

  let logoData = null
  if (branding?.logoUrl) {
    logoData = await toDataURL(branding.logoUrl)
  }

  const days = (trip.itinerary || '')
    .split(/\n\s*\n/)
    .filter((b) => b.trim().match(/^Day \d+:/im))

  let y = margin

  // ── COVER PAGE ──
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, pw, ph, 'F')

  // Accent bar at top
  pdf.setFillColor(primary)
  pdf.rect(0, 0, pw, 6, 'F')

  // Logo
  if (logoData) {
    const logoH = 14
    const logoW = 50
    try {
      pdf.addImage(logoData, 'PNG', margin, y + 20, logoW, logoH)
    } catch {}
    y += logoH + 30
  } else {
    // Agency name fallback
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.setTextColor(primary)
    pdf.text(agencyName, margin, y + 40)
    y += 48
  }

  if (tagline) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(TEXT_MUTED)
    pdf.text(tagline, margin, y)
    y += 8
  }

  y += 20

  // Destination title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(32)
  pdf.setTextColor(TEXT)
  const lines = pdf.splitTextToSize(trip.destination, contentW)
  lines.forEach((l) => {
    pdf.text(l, margin, y)
    y += 14
  })

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(14)
  pdf.setTextColor(TEXT_MUTED)
  pdf.text('AI-Generated Travel Itinerary', margin, y)
  y += 8

  const createdDate = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  pdf.setFontSize(10)
  pdf.setTextColor(TEXT_MUTED)
  pdf.text(`Created on ${createdDate}`, margin, y)
  y += 20

  // Trip summary box
  const boxH = 50
  const boxY = y
  pdf.setFillColor(30, 41, 59)
  pdf.roundedRect(margin, boxY, contentW, boxH, 4, 4, 'F')

  // Accent border left
  pdf.setFillColor(primary)
  pdf.rect(margin, boxY, 3, boxH, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  const items = [
    { label: 'Budget', value: `₹${(trip.budget || 0).toLocaleString()}` },
    { label: 'Duration', value: `${trip.days || 0} days` },
    { label: 'Travel Type', value: trip.travelType || 'N/A' },
    { label: 'Status', value: trip.tripStatus || 'Generated' },
  ]
  const itemW = contentW / 4
  items.forEach((item, i) => {
    const ix = margin + i * itemW + 8
    pdf.setTextColor(TEXT_MUTED)
    pdf.text(item.label, ix, boxY + 12)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(TEXT)
    pdf.text(item.value, ix, boxY + 30)
    pdf.setFontSize(10)
  })

  y = boxY + boxH + 16

  // Selected Places
  if (trip.selectedPlaces) {
    const placesList = trip.selectedPlaces.split(',').map((s) => s.trim()).filter(Boolean)
    if (placesList.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(primary)
      pdf.text('Selected Attractions', margin, y)
      y += 6
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(TEXT_MUTED)
      const placesStr = placesList.join('  •  ')
      const placeLines = pdf.splitTextToSize(placesStr, contentW)
      placeLines.forEach((l) => {
        pdf.text(l, margin, y)
        y += 5
      })
      y += 8
    }
  }

  // Mood section
  if (trip.moodDescription) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(accent)
    pdf.text('Mood', margin, y)
    y += 6
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(TEXT_MUTED)
    const moodLines = pdf.splitTextToSize(trip.moodDescription, contentW)
    moodLines.forEach((l) => {
      pdf.text(l, margin, y)
      y += 5
    })
    y += 8
  }

  // Weather
  if (trip.weatherSummary) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor('#fbbf24')
    pdf.text('Weather Forecast', margin, y)
    y += 6
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(TEXT_MUTED)
    const wLines = pdf.splitTextToSize(trip.weatherSummary, contentW)
    wLines.forEach((l) => {
      pdf.text(l, margin, y)
      y += 5
    })
    y += 8
  }

  // ── NEW PAGE: BUDGET ──
  if (trip.budgetBreakdown) {
    pdf.addPage()
    y = margin + 6

    const bd = trip.budgetBreakdown
    const bLabels = ['Hotel', 'Food', 'Transport', 'Activities', 'Misc']
    const bKeys = ['hotelCost', 'foodCost', 'transportCost', 'activityCost', 'miscCost']
    const bColors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316']
    const totalBudget = bKeys.reduce((s, k) => s + (bd[k] || 0), 0)

    pdf.setFillColor(primary)
    pdf.rect(0, 0, pw, 6, 'F')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(TEXT)
    pdf.text('Budget Breakdown', margin, y)
    y += 16

    // Budget bar visualization
    pdf.setFontSize(10)
    bKeys.forEach((k, i) => {
      const val = bd[k] || 0
      const pct = totalBudget > 0 ? val / totalBudget : 0
      const barW = contentW * pct
      const barH = 14
      const labelX = margin
      const valX = margin + contentW

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(TEXT)
      pdf.text(bLabels[i], labelX, y + 4)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(TEXT_MUTED)
      const valStr = `₹${val.toLocaleString()}`
      const valW = pdf.getTextWidth(valStr)
      pdf.text(valStr, valX - valW, y + 4)

      if (barW > 0) {
        pdf.setFillColor(bColors[i])
        pdf.roundedRect(margin, y + 8, Math.max(barW, 4), 6, 2, 2, 'F')
      }

      y += 22
    })

    // Total
    y += 4
    pdf.setDrawColor(primary)
    pdf.setLineWidth(0.5)
    pdf.line(margin, y, margin + contentW, y)
    y += 8
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.setTextColor(TEXT)
    const totalStr = `Total: ₹${totalBudget.toLocaleString()}`
    pdf.text(totalStr, margin, y)
  }

  // ── ITINERARY PAGES ──
  if (days.length > 0) {
    days.forEach((day, i) => {
      pdf.addPage()
      y = margin + 6

      pdf.setFillColor(primary)
      pdf.rect(0, 0, pw, 6, 'F')

      const [header, ...rest] = day.split('\n')
      const dayMatch = header.match(/Day\s*(\d+):\s*(.*)/i)
      const dayNum = dayMatch ? dayMatch[1] : (i + 1).toString()
      const dayTitle = dayMatch ? dayMatch[2] : header

      // Day header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(22)
      pdf.setTextColor(TEXT)
      pdf.text(`Day ${dayNum}`, margin, y)
      y += 12

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(14)
      pdf.setTextColor(accent)
      const titleLines = pdf.splitTextToSize(dayTitle, contentW)
      titleLines.forEach((l) => {
        pdf.text(l, margin, y)
        y += 8
      })

      y += 4

      // Separator
      pdf.setDrawColor(primary)
      pdf.setLineWidth(0.3)
      pdf.line(margin, y, margin + contentW, y)
      y += 8

      // Activities
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(TEXT_MUTED)

      const text = rest.join('\n').trim()
      // Try to parse time-based entries (e.g. "8:00 AM - Breakfast" or "Morning: Visit temple")
      const entries = text.split('\n').filter((l) => l.trim())

      entries.forEach((entry) => {
        const trimmed = entry.trim()

        // Check if it's a time entry (starts with time pattern or "-")
        const isTimeEntry = /^[\d:APM\s-]+[-–]/.test(trimmed) || /^- /.test(trimmed)
        const isSubheading = /^[A-Z][a-z]+:/.test(trimmed) && trimmed.length < 50

        if (isSubheading) {
          y += 2
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.setTextColor(TEXT)
          const subLines = pdf.splitTextToSize(trimmed, contentW)
          subLines.forEach((l) => {
            pdf.text(l, margin, y)
            y += 5.5
          })
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(TEXT_MUTED)
        } else if (isTimeEntry) {
          const timeColor = primary
          // Highlight time part
          const timeMatch = trimmed.match(/^([\d:APM\s-]+[-–])/)
          if (timeMatch) {
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(10)
            pdf.setTextColor(timeColor)
            const timePart = timeMatch[1]
            pdf.text(timePart, margin, y)
            const tw = pdf.getTextWidth(timePart)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(TEXT_MUTED)
            const restText = trimmed.slice(timePart.length).trim()
            const restLines = pdf.splitTextToSize(restText, contentW - tw - 2)
            restLines.forEach((l, li) => {
              pdf.text(l, margin + (li === 0 ? tw + 2 : 0), y)
              y += 5.5
            })
          } else {
            const entryLines = pdf.splitTextToSize(trimmed, contentW)
            entryLines.forEach((l) => {
              pdf.text(l, margin, y)
              y += 5.5
            })
          }
        } else {
          const entryLines = pdf.splitTextToSize(trimmed, contentW)
          entryLines.forEach((l) => {
            pdf.text(l, margin, y)
            y += 5.5
          })
        }

        // Check if we need a new page
        if (y > ph - 30) {
          pdf.addPage()
          y = margin + 6
          pdf.setFillColor(primary)
          pdf.rect(0, 0, pw, 6, 'F')
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(TEXT_MUTED)
        }
      })
    })
  }

  // ── FOOTER ON EACH PAGE ──
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFillColor(primary)
    pdf.rect(0, ph - 12, pw, 12, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor('#ffffff')
    const footerText = `Powered by ${agencyName}  |  Page ${i} of ${totalPages}`
    const fw = pdf.getTextWidth(footerText)
    pdf.text(footerText, (pw - fw) / 2, ph - 4)
  }

  pdf.save(`${trip.destination.replace(/[^a-zA-Z0-9]/g, '-')}-Itinerary.pdf`)
}
