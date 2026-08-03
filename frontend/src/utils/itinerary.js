export function cleanItineraryLine(line) {
  return (line || '')
    .replace(/^[\s#>*\-\u2022]+/, '')
    .replace(/\*\*|\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseItineraryDays(itinerary) {
  const intro = []
  const days = []
  let current = null

  for (const raw of (itinerary || '').split('\n')) {
    const line = cleanItineraryLine(raw)
    if (!line || /^-{3,}$/.test(line)) continue

    const dayMatch = line.match(/^DAY\s*(\d+)\s*[:.\-]?\s*(.*)$/i)
    if (dayMatch) {
      const dayNum = dayMatch[1]
      const title = dayMatch[2]
      const isCostSection = /total|cost|budget|grand/i.test(title)
      if (isCostSection) {
        const target = days.find((d) => d.dayNum === dayNum) || current
        if (target) {
          target.content.push(line)
        } else {
          current = { dayNum, title, content: [line] }
          days.push(current)
        }
      } else {
        current = { dayNum, title, content: [] }
        days.push(current)
      }
    } else if (current) {
      current.content.push(line)
    } else {
      intro.push(line)
    }
  }

  return { intro: intro.join(' '), days }
}
