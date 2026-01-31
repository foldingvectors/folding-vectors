import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import { PERSPECTIVES } from './perspectives'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedResult = Record<string, any>

function parseResult(resultText: string): ParsedResult | null {
  try {
    const cleaned = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function getPerspectiveName(id: string): string {
  const perspective = PERSPECTIVES.find(p => p.id === id)
  return perspective?.name || id
}

function getFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Export to PDF - Professional Memo Style
export async function exportToPDF(
  perspectives: string[],
  results: Record<string, string>,
  title: string = 'Multi-Perspective Analysis',
  recipient?: string
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 25
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Header line
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // MEMORANDUM header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('MEMORANDUM', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Meta info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`TO:`, margin, yPos)
  doc.text(recipient || 'Decision Makers', margin + 20, yPos)
  yPos += 6
  doc.text(`FROM:`, margin, yPos)
  doc.text(`Folding Vectors`, margin + 20, yPos)
  yPos += 6
  doc.text(`DATE:`, margin, yPos)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 20, yPos)
  yPos += 6
  doc.text(`RE:`, margin, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin + 20, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 10

  // Header line
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 15

  // Process each perspective
  perspectives.forEach((perspectiveId, index) => {
    const parsed = parseResult(results[perspectiveId] || '')
    if (!parsed) return

    const perspectiveName = getPerspectiveName(perspectiveId)

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = margin
    }

    // Section number and title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${perspectiveName.toUpperCase()}`, margin, yPos)
    yPos += 2
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, margin + 60, yPos)
    yPos += 8

    // Process all fields in the parsed result
    Object.entries(parsed).forEach(([key, value]) => {
      if (!value) return

      const label = getFieldLabel(key)

      // Check for new page
      if (yPos > 265) {
        doc.addPage()
        yPos = margin
      }

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, margin, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = margin
          }
          const bullet = `  ${String.fromCharCode(8226)} `
          const lines = doc.splitTextToSize(`${bullet}${item}`, contentWidth - 10)
          doc.text(lines, margin + 5, yPos)
          yPos += lines.length * 4 + 2
        })
      } else if (typeof value === 'string') {
        const lines = doc.splitTextToSize(`  ${value}`, contentWidth - 5)
        doc.text(lines, margin, yPos)
        yPos += lines.length * 4 + 2
      }

      yPos += 3
    })

    yPos += 8
  })

  // Footer on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(margin, 285, pageWidth - margin, 285)
    doc.text(`CONFIDENTIAL`, margin, 290)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' })
    doc.text(`Folding Vectors`, pageWidth - margin, 290, { align: 'right' })
    doc.setTextColor(0)
  }

  doc.save(`${title.replace(/\s+/g, '_')}_Memo.pdf`)
}

// Export to Word - Professional Memo Style
export async function exportToWord(
  perspectives: string[],
  results: Record<string, string>,
  title: string = 'Multi-Perspective Analysis',
  recipient?: string
) {
  const children: (Paragraph | Table)[] = []

  // Header border
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
      },
      spacing: { after: 200 },
    })
  )

  // MEMORANDUM header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'MEMORANDUM',
          bold: true,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Meta info table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'TO:', bold: true, size: 20 })] })],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: recipient || 'Decision Makers', size: 20 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'FROM:', bold: true, size: 20 })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Folding Vectors', size: 20 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'DATE:', bold: true, size: 20 })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), size: 20 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'RE:', bold: true, size: 20 })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 20 })] })],
          }),
        ],
      }),
    ],
  })

  children.push(metaTable)

  // Header border bottom
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
      },
      spacing: { before: 200, after: 400 },
    })
  )

  // Process each perspective
  perspectives.forEach((perspectiveId, index) => {
    const parsed = parseResult(results[perspectiveId] || '')
    if (!parsed) return

    const perspectiveName = getPerspectiveName(perspectiveId)

    // Section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${perspectiveName.toUpperCase()}`,
            bold: true,
            size: 24,
          }),
        ],
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
        },
        spacing: { before: 400, after: 200 },
      })
    )

    // Process all fields
    Object.entries(parsed).forEach(([key, value]) => {
      if (!value) return

      const label = getFieldLabel(key)

      // Field label
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${label}:`,
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 150, after: 50 },
        })
      )

      if (Array.isArray(value)) {
        value.forEach((item) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `    \u2022  ${item}`,
                  size: 20,
                }),
              ],
              spacing: { after: 50 },
            })
          )
        })
      } else if (typeof value === 'string') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `    ${value}`,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        )
      }
    })
  })

  // Footer
  children.push(
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
      },
      spacing: { before: 600 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'CONFIDENTIAL  |  Folding Vectors',
          color: '666666',
          size: 16,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${title.replace(/\s+/g, '_')}_Memo.docx`)
}

// Types for synthesis export
interface SynthesisSummary {
  name: string
  summary: string
  recommendation: string
  score: number
}

interface SynthesisInsight {
  text: string
  details?: string
}

// Calculate score from text
function calculateScore(text: string): number {
  const lowerText = text.toLowerCase()
  const strongPositive = ['strongly recommend', 'highly recommend', 'excellent', 'outstanding', 'exceptional', 'compelling']
  const positive = ['recommend', 'proceed', 'invest', 'promising', 'favorable', 'good', 'solid', 'strong']
  const negative = ['concern', 'risk', 'caution', 'careful', 'uncertain', 'questionable']
  const strongNegative = ['avoid', 'reject', 'significant risk', 'major concern', 'not recommend', 'serious issues']

  let score = 5
  if (strongPositive.some(term => lowerText.includes(term))) score = 9
  else if (strongNegative.some(term => lowerText.includes(term))) score = 2
  else if (positive.some(term => lowerText.includes(term))) score = 7
  else if (negative.some(term => lowerText.includes(term))) score = 4

  if (lowerText.includes('but') || lowerText.includes('however')) score = Math.max(3, score - 1)
  return Math.min(10, Math.max(1, score))
}

// Extract synthesis data from results
function extractSynthesisData(perspectives: string[], results: Record<string, string>): {
  summaries: SynthesisSummary[]
  agreements: SynthesisInsight[]
  tensions: SynthesisInsight[]
  avgScore: number
} {
  const summaries: SynthesisSummary[] = []
  const allOpportunities: { text: string; sourceName: string }[] = []
  const allRisks: { text: string; sourceName: string }[] = []

  perspectives.forEach(id => {
    const parsed = parseResult(results[id] || '')
    if (!parsed) return

    const perspective = PERSPECTIVES.find(p => p.id === id)
    const name = perspective?.name || id
    const summary = parsed.Summary || parsed.summary || ''
    const recommendation = parsed.Recommendation || parsed.recommendation || ''
    const combinedText = `${summary} ${recommendation}`
    const score = calculateScore(combinedText)

    if (summary) {
      summaries.push({ name, summary: String(summary), recommendation: String(recommendation), score })
    }

    // Collect opportunities and risks
    Object.keys(parsed).forEach(key => {
      const value = parsed[key]
      if (!Array.isArray(value)) return

      if (key.toLowerCase().includes('opportunit') || key.toLowerCase().includes('strength') || key.toLowerCase().includes('tailwind')) {
        value.forEach(item => allOpportunities.push({ text: String(item), sourceName: name }))
      }
      if (key.toLowerCase().includes('risk') || key.toLowerCase().includes('concern') || key.toLowerCase().includes('headwind') || key.toLowerCase().includes('gap')) {
        value.forEach(item => allRisks.push({ text: String(item), sourceName: name }))
      }
    })
  })

  // Find agreements and tensions
  const agreements: SynthesisInsight[] = []
  const tensions: SynthesisInsight[] = []

  // Check for shared opportunities/risks
  allOpportunities.forEach((opp1, i) => {
    allOpportunities.slice(i + 1).forEach(opp2 => {
      if (opp1.sourceName === opp2.sourceName) return
      const words1 = opp1.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const words2 = opp2.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const overlap = words1.filter(w => words2.some(w2 => w.includes(w2) || w2.includes(w)))
      if (overlap.length >= 2 && agreements.length < 5) {
        agreements.push({
          text: `${opp1.sourceName} and ${opp2.sourceName} both see opportunity in: ${overlap.slice(0, 3).join(', ')}`,
          details: `${opp1.sourceName}: "${opp1.text}"\n${opp2.sourceName}: "${opp2.text}"`
        })
      }
    })
  })

  // Check for tensions (opp vs risk)
  allOpportunities.forEach(opp => {
    allRisks.forEach(risk => {
      if (opp.sourceName === risk.sourceName) return
      const oppWords = opp.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const riskWords = risk.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const overlap = oppWords.filter(w => riskWords.some(rw => w.includes(rw) || rw.includes(w)))
      if (overlap.length >= 2 && tensions.length < 5) {
        tensions.push({
          text: `${opp.sourceName} sees opportunity in ${overlap.slice(0, 2).join(' & ')}, while ${risk.sourceName} flags it as a risk`,
          details: `${opp.sourceName} (Opportunity): "${opp.text}"\n${risk.sourceName} (Risk): "${risk.text}"`
        })
      }
    })
  })

  const avgScore = summaries.length > 0
    ? Math.round((summaries.reduce((acc, s) => acc + s.score, 0) / summaries.length) * 10) / 10
    : 0

  return { summaries, agreements, tensions, avgScore }
}

// Export Synthesis to PDF
export async function exportSynthesisToPDF(
  perspectives: string[],
  results: Record<string, string>,
  title: string = 'Multi-Perspective Synthesis',
  recipient?: string
) {
  const { summaries, agreements, tensions, avgScore } = extractSynthesisData(perspectives, results)
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 25
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Header
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SYNTHESIS REPORT', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Meta
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`TO:`, margin, yPos)
  doc.text(recipient || 'Decision Makers', margin + 20, yPos)
  yPos += 6
  doc.text(`FROM:`, margin, yPos)
  doc.text(`Folding Vectors`, margin + 20, yPos)
  yPos += 6
  doc.text(`DATE:`, margin, yPos)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 20, yPos)
  yPos += 6
  doc.text(`RE:`, margin, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin + 20, yPos)
  yPos += 10

  doc.setFont('helvetica', 'normal')
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 15

  // Composite Score
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('COMPOSITE SCORE', margin, yPos)
  yPos += 8

  doc.setFontSize(24)
  doc.text(`${avgScore}/10`, margin, yPos)
  yPos += 15

  // Perspective Scores Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PERSPECTIVE SCORES', margin, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  summaries.forEach(s => {
    if (yPos > 265) { doc.addPage(); yPos = margin }
    doc.setFont('helvetica', 'bold')
    doc.text(`${s.name}: ${s.score}/10`, margin, yPos)
    yPos += 5
    doc.setFont('helvetica', 'normal')
    // Full summary without truncation
    const lines = doc.splitTextToSize(s.summary, contentWidth - 10)
    lines.forEach((line: string) => {
      if (yPos > 270) { doc.addPage(); yPos = margin }
      doc.text(line, margin + 5, yPos)
      yPos += 4
    })
    yPos += 5
  })
  yPos += 5

  // Points of Agreement
  if (agreements.length > 0) {
    if (yPos > 240) { doc.addPage(); yPos = margin }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('POINTS OF AGREEMENT', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    agreements.forEach(a => {
      if (yPos > 265) { doc.addPage(); yPos = margin }
      const lines = doc.splitTextToSize(`+ ${a.text}`, contentWidth)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 4 + 4
    })
    yPos += 5
  }

  // Points of Tension
  if (tensions.length > 0) {
    if (yPos > 240) { doc.addPage(); yPos = margin }
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('POINTS OF TENSION', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    tensions.forEach(t => {
      if (yPos > 265) { doc.addPage(); yPos = margin }
      const lines = doc.splitTextToSize(`~ ${t.text}`, contentWidth)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 4 + 4
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.setLineWidth(0.3)
    doc.line(margin, 285, pageWidth - margin, 285)
    doc.text(`CONFIDENTIAL`, margin, 290)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' })
    doc.text(`Folding Vectors`, pageWidth - margin, 290, { align: 'right' })
    doc.setTextColor(0)
  }

  doc.save(`${title.replace(/\s+/g, '_')}_Synthesis.pdf`)
}

// Export Synthesis to Word
export async function exportSynthesisToWord(
  perspectives: string[],
  results: Record<string, string>,
  title: string = 'Multi-Perspective Synthesis',
  recipient?: string
) {
  const { summaries, agreements, tensions, avgScore } = extractSynthesisData(perspectives, results)
  const children: (Paragraph | Table)[] = []

  // Header
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' } },
      spacing: { after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'SYNTHESIS REPORT', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Meta table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({ children: [
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'TO:', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: recipient || 'Decision Makers', size: 20 })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'FROM:', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Folding Vectors', size: 20 })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DATE:', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), size: 20 })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'RE:', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 20 })] })] }),
      ]}),
    ],
  })
  children.push(metaTable)

  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' } },
      spacing: { before: 200, after: 400 },
    })
  )

  // Composite Score
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'COMPOSITE SCORE', bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    })
  )
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `${avgScore}/10`, bold: true, size: 48 })],
      spacing: { after: 300 },
    })
  )

  // Perspective Scores
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'PERSPECTIVE SCORES', bold: true, size: 24 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
      spacing: { before: 200, after: 200 },
    })
  )

  summaries.forEach(s => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${s.name}: ${s.score}/10`, bold: true, size: 22 })],
        spacing: { before: 150, after: 50 },
      })
    )
    children.push(
      new Paragraph({
        children: [new TextRun({ text: s.summary, size: 20 })],
        spacing: { after: 100 },
      })
    )
  })

  // Agreements
  if (agreements.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'POINTS OF AGREEMENT', bold: true, size: 24 })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        spacing: { before: 300, after: 200 },
      })
    )
    agreements.forEach(a => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `+ ${a.text}`, size: 20 })],
          spacing: { after: 100 },
        })
      )
    })
  }

  // Tensions
  if (tensions.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'POINTS OF TENSION', bold: true, size: 24 })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        spacing: { before: 300, after: 200 },
      })
    )
    tensions.forEach(t => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `~ ${t.text}`, size: 20 })],
          spacing: { after: 100 },
        })
      )
    })
  }

  // Footer
  children.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
      spacing: { before: 600 },
    })
  )
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'CONFIDENTIAL  |  Folding Vectors', color: '666666', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  )

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${title.replace(/\s+/g, '_')}_Synthesis.docx`)
}
