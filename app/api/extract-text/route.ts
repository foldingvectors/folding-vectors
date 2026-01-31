import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { extractText } from 'unpdf'

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await extractText(buffer)
    // unpdf returns { text: string, totalPages: number } or { text: string[] } depending on version
    const text = Array.isArray(result.text) ? result.text.join('\n') : String(result.text || '')
    return text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    let extractedText = ''

    if (fileName.endsWith('.txt')) {
      // Plain text
      extractedText = await file.text()
    } else if (fileName.endsWith('.pdf')) {
      // PDF extraction using unpdf
      try {
        const arrayBuffer = await file.arrayBuffer()
        extractedText = await extractTextFromPDF(arrayBuffer)
      } catch (err) {
        console.error('PDF parsing error:', err)
        return NextResponse.json(
          { error: 'Failed to parse PDF. Please ensure the PDF contains text (not just images).' },
          { status: 400 }
        )
      }
    } else if (fileName.endsWith('.docx')) {
      // DOCX extraction using mammoth
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      } catch (err) {
        console.error('DOCX parsing error:', err)
        return NextResponse.json(
          { error: 'Failed to parse DOCX file.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please use .txt, .pdf, or .docx' },
        { status: 400 }
      )
    }

    if (!extractedText || !String(extractedText).trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text: String(extractedText) })
  } catch (error) {
    console.error('Text extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}
