'use client'

import { useRef, useState, useEffect } from 'react'

type Template = {
  id: string
  name: string
  familyName?: string | null
  backgroundPath: string
  textColor: string
  textPosition: string
  overlayOpacity: number
  fontFamily: string
}

type Submission = {
  id: string
  authorName: string
  bookChapter: string
  content: string
  photoPath?: string | null
}

type Props = {
  submission: Submission
  template: Template | null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export default function PosterCanvas({ submission, template }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [rendered, setRendered] = useState(false)

  const SIZE = 1080

  const draw = async () => {
    const canvas = canvasRef.current
    if (!canvas || !template) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = SIZE
    canvas.height = SIZE

    // Fond noir par défaut
    ctx.fillStyle = '#1A1612'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // Image de fond
    try {
      const bg = await loadImage(template.backgroundPath)
      ctx.drawImage(bg, 0, 0, SIZE, SIZE)
    } catch {}

    // Overlay
    ctx.fillStyle = `rgba(0,0,0,${template.overlayOpacity})`
    ctx.fillRect(0, 0, SIZE, SIZE)

    const textColor = template.textColor || '#FFFFFF'
    const gold = '#C9A84C'

    // Famille en haut centré
    if (template.familyName) {
      ctx.fillStyle = gold
      ctx.font = '500 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(template.familyName.toUpperCase(), SIZE / 2, 80)
      ctx.strokeStyle = gold
      ctx.globalAlpha = 0.6
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(SIZE / 2 - 40, 104)
      ctx.lineTo(SIZE / 2 + 40, 104)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Photo du prédicateur
    let photoImg: HTMLImageElement | null = null
    if (submission.photoPath) {
      try { photoImg = await loadImage(submission.photoPath) } catch {}
    }

    const photoSize = 450
    const lineLen = 80
    const lineGap = 36
    const textFontSize = 40
    const refFontSize = 26
    const authorFontSize = 24
    const textMaxWidth = SIZE - 200

    // Mesure hauteur totale du bloc pour le centrer selon position
    ctx.font = `italic 400 ${textFontSize}px ${template.fontFamily}, Georgia, serif`
    const lines = wrapText(ctx, submission.content, textMaxWidth)
    const lineH = textFontSize * 1.75
    const textBlockH = lines.length * lineH
    const blockTotal =
      (photoImg ? photoSize + 32 : 0) +
      lineGap +
      textBlockH +
      lineGap +
      30 +
      refFontSize + 12 +
      authorFontSize

    const pos = template.textPosition || 'bottom'
    let y = 0
    if (pos === 'top') y = 140
    else if (pos === 'center') y = (SIZE - blockTotal) / 2
    else y = SIZE - blockTotal - 100

    // Photo
    if (photoImg) {
      const cx = SIZE / 2
      const cy = y + photoSize / 2
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(photoImg, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize)
      ctx.restore()
      // Bordure dorée
      ctx.strokeStyle = gold
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2 + 2, 0, Math.PI * 2)
      ctx.stroke()
      y += photoSize + 32
    }

    // Ligne déco haut
    ctx.strokeStyle = gold
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.moveTo(SIZE / 2 - lineLen / 2, y)
    ctx.lineTo(SIZE / 2 + lineLen / 2, y)
    ctx.stroke()
    y += lineGap

    // Texte méditation
    ctx.fillStyle = textColor
    ctx.font = `italic 400 ${textFontSize}px ${template.fontFamily}, Georgia, serif`
    ctx.textAlign = 'center'
    for (const line of lines) {
    ctx.fillText(line, SIZE / 2, y + textFontSize * 0.35)
    y += lineH
  }
  y += lineGap * 0.3

    // Ligne déco bas
    ctx.strokeStyle = gold
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(SIZE / 2 - lineLen / 2, y)
    ctx.lineTo(SIZE / 2 + lineLen / 2, y)
    ctx.stroke()
    y += 36

    // Référence biblique
    ctx.fillStyle = gold
    ctx.font = `500 ${refFontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(submission.bookChapter.toUpperCase(), SIZE / 2, y)
    y += refFontSize + 14

    // Auteur
    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.75
    ctx.font = `300 ${authorFontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(submission.authorName, SIZE / 2, y)
    ctx.globalAlpha = 1

    setRendered(true)
  }

  useEffect(() => {
    draw()
  }, [template, submission])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setDownloading(true)
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `meditation-${submission.bookChapter.replace(/\s/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">

      <div style={{
        width: '540px',
        height: '540px',
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '540px',
            height: '540px',
            display: 'block',
          }}
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading || !rendered}
        className="bg-[#1A1612] text-[#F0DFA0] px-8 py-3 rounded-xl text-sm font-medium hover:bg-[#2A2018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {downloading ? 'Export en cours...' : 'Télécharger (PNG 1080×1080)'}
      </button>

    </div>
  )
}