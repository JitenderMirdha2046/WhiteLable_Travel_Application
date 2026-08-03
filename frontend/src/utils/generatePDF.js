import { jsPDF } from 'jspdf'
import { parseItineraryDays } from './itinerary'

const BLACK = [0, 0, 0]
const GRAY = [80, 80, 80]
const WHITE = [255, 255, 255]

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

  const agencyName = branding?.agencyName || branding?.name || 'Travel Agency'
  const phone = branding?.phone || ''
  const email = branding?.email || ''
  const tagline = branding?.tagline || ''

  const { intro: itineraryIntro, days } = parseItineraryDays(trip.itinerary)

  let y = margin

  // ── COVER PAGE ──
  pdf.setFillColor(...WHITE)
  pdf.rect(0, 0, pw, ph, 'F')

  // Agency header
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(...BLACK)
  pdf.text(agencyName, margin, y + 8)

  const contactParts = []
  if (phone) contactParts.push(`Phone: ${phone}`)
  if (email) contactParts.push(`Email: ${email}`)
  if (tagline) contactParts.push(tagline)
  if (contactParts.length > 0) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(...GRAY)
    pdf.text(contactParts.join('   |   '), margin, y + 16)
    y += 22
  } else {
    y += 16
  }

  // Separator line
  pdf.setDrawColor(...BLACK)
  pdf.setLineWidth(0.5)
  pdf.line(margin, y, margin + contentW, y)
  y += 16

  // Destination title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(30)
  pdf.setTextColor(...BLACK)
  const lines = pdf.splitTextToSize(trip.destination, contentW)
  lines.forEach((l) => {
    pdf.text(l, margin, y)
    y += 13
  })

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(13)
  pdf.setTextColor(...GRAY)
  pdf.text('Travel Itinerary', margin, y)
  y += 7

  const createdDate = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  pdf.setFontSize(10)
  pdf.text(createdDate ? `Created on ${createdDate}` : '', margin, y)
  y += 16

  // Trip summary
  const items = [
    { label: 'Budget', value: `₹${(trip.budget || 0).toLocaleString()}` },
    { label: 'Duration', value: `${trip.days || 0} days` },
    { label: 'Travel Type', value: trip.travelType || 'N/A' },
    { label: 'Status', value: trip.tripStatus || 'Generated' },
  ]
  const itemW = contentW / 4
  items.forEach((item, i) => {
    const ix = margin + i * itemW
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...GRAY)
    pdf.text(item.label, ix, y)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.setTextColor(...BLACK)
    pdf.text(item.value, ix, y + 7)
  })
  y += 22

  // Selected Places
  if (trip.selectedPlaces) {
    const placesList = trip.selectedPlaces.split(',').map((s) => s.trim()).filter(Boolean)
    if (placesList.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(...BLACK)
      pdf.text('Selected Attractions', margin, y)
      y += 7
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(...GRAY)
      const placesStr = placesList.join('  •  ')
      const placeLines = pdf.splitTextToSize(placesStr, contentW)
      placeLines.forEach((l) => {
        pdf.text(l, margin, y)
        y += 5
      })
      y += 10
    }
  }

  // Mood section
  if (trip.moodDescription) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...BLACK)
    pdf.text('Mood', margin, y)
    y += 7
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...GRAY)
    const moodLines = pdf.splitTextToSize(trip.moodDescription, contentW)
    moodLines.forEach((l) => {
      pdf.text(l, margin, y)
      y += 5
    })
    y += 10
  }

  // Weather
  if (trip.weatherSummary) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...BLACK)
    pdf.text('Weather Forecast', margin, y)
    y += 7
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...GRAY)
    const wLines = pdf.splitTextToSize(trip.weatherSummary, contentW)
    wLines.forEach((l) => {
      pdf.text(l, margin, y)
      y += 5
    })
    y += 10
  }

  // Intro paragraph
  if (itineraryIntro) {
    if (y > ph - 60) {
      pdf.addPage()
      y = margin + 6
    }
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10.5)
    pdf.setTextColor(...GRAY)
    const introLines = pdf.splitTextToSize(itineraryIntro, contentW)
    introLines.forEach((l) => {
      pdf.text(l, margin, y)
      y += 5.5
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
    const totalBudget = bKeys.reduce((s, k) => s + (bd[k] || 0), 0)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(...BLACK)
    pdf.text('Budget Breakdown', margin, y)
    y += 14

    pdf.setFontSize(10)
    bKeys.forEach((k, i) => {
      const val = bd[k] || 0
      const pct = totalBudget > 0 ? val / totalBudget : 0
      const barW = contentW * pct

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(...BLACK)
      pdf.text(bLabels[i], margin, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...GRAY)
      const valStr = `₹${val.toLocaleString()}`
      const valW = pdf.getTextWidth(valStr)
      pdf.text(valStr, margin + contentW - valW, y)

      if (barW > 0) {
        pdf.setFillColor(...BLACK)
        pdf.roundedRect(margin, y + 4, Math.max(barW, 4), 2.5, 1, 1, 'F')
      }

      y += 12
    })

    y += 6
    pdf.setDrawColor(...BLACK)
    pdf.setLineWidth(0.5)
    pdf.line(margin, y, margin + contentW, y)
    y += 9
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.setTextColor(...BLACK)
    pdf.text(`Total: ₹${totalBudget.toLocaleString()}`, margin, y)
  }

  // ── ITINERARY PAGES ──
  if (days.length > 0) {
    days.forEach((day, i) => {
      pdf.addPage()
      y = margin + 6

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(...BLACK)
      pdf.text(`Day ${day.dayNum}`, margin, y)
      y += 10

      if (day.title) {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(13)
        pdf.setTextColor(...BLACK)
        const titleLines = pdf.splitTextToSize(day.title, contentW)
        titleLines.forEach((l) => {
          pdf.text(l, margin, y)
          y += 7
        })
      }

      y += 4
      pdf.setDrawColor(...BLACK)
      pdf.setLineWidth(0.3)
      pdf.line(margin, y, margin + contentW, y)
      y += 8

      day.content.forEach((trimmed) => {
        const isSubheading = /^[A-Z][a-z]+:/.test(trimmed) && trimmed.length < 60
        const isTimeEntry = /^[\d:APM\s-]+[-–]/.test(trimmed)

        if (isSubheading) {
          y += 2
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10.5)
          pdf.setTextColor(...BLACK)
          const subLines = pdf.splitTextToSize(trimmed, contentW)
          subLines.forEach((l) => {
            pdf.text(l, margin, y)
            y += 5.5
          })
        } else if (isTimeEntry) {
          const timeMatch = trimmed.match(/^([\d:APM\s-]+[-–])/)
          if (timeMatch) {
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(10)
            pdf.setTextColor(...BLACK)
            const timePart = timeMatch[1]
            pdf.text(timePart, margin, y)
            const tw = pdf.getTextWidth(timePart)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(...GRAY)
            const restText = trimmed.slice(timePart.length).trim()
            const restLines = pdf.splitTextToSize(restText, contentW - tw - 2)
            restLines.forEach((l, li) => {
              pdf.text(l, margin + (li === 0 ? tw + 2 : 0), y)
              y += 5.5
            })
          } else {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(10)
            pdf.setTextColor(...GRAY)
            const entryLines = pdf.splitTextToSize(trimmed, contentW)
            entryLines.forEach((l) => {
              pdf.text(l, margin, y)
              y += 5.5
            })
          }
        } else {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(...GRAY)
          const entryLines = pdf.splitTextToSize(trimmed, contentW)
          entryLines.forEach((l) => {
            pdf.text(l, margin, y)
            y += 5.5
          })
        }

        if (y > ph - 30) {
          pdf.addPage()
          y = margin + 6
        }
      })
    })
  }

  // ── FOOTER ON EACH PAGE ──
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setDrawColor(...GRAY)
    pdf.setLineWidth(0.2)
    pdf.line(margin, ph - 14, margin + contentW, ph - 14)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...GRAY)
    const footerText = `${agencyName}  |  Page ${i} of ${totalPages}`
    const fw = pdf.getTextWidth(footerText)
    pdf.text(footerText, (pw - fw) / 2, ph - 7)
  }

  pdf.save(`${trip.destination.replace(/[^a-zA-Z0-9]/g, '-')}-Itinerary.pdf`)
}
