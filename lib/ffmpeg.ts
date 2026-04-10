import ffmpeg from 'fluent-ffmpeg'
import { writeFile, unlink, mkdir, readFile } from 'fs/promises'
import path from 'path'
import os from 'os'
import { createCanvas, loadImage } from 'canvas'

const ffmpegPath = require('ffmpeg-static')
ffmpeg.setFfmpegPath(ffmpegPath)

interface GenerateVideoParams {
  audioBuffer: Buffer
  backgroundBuffer: Buffer
  photoBuffer?: Buffer | null
  authorName: string
  bookChapter: string
  familyName?: string | null
  content?: string | null
  textColor: string
  overlayOpacity: number
  fontFamily: string
  outputFilename: string
}

export async function generateVideo({
  audioBuffer,
  backgroundBuffer,
  photoBuffer,
  authorName,
  bookChapter,
  familyName,
  content,
  textColor,
  overlayOpacity,
  fontFamily,
  outputFilename,
}: GenerateVideoParams): Promise<Buffer> {
  const SIZE = 1080
  const gold = '#C9A84C'

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  // Fond
  ctx.fillStyle = '#1A1612'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Image de fond
  try {
    const bg = await loadImage(backgroundBuffer)
    ctx.drawImage(bg, 0, 0, SIZE, SIZE)
  } catch {}

  // Overlay
  ctx.fillStyle = `rgba(0,0,0,${overlayOpacity})`
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Famille en haut
  if (familyName) {
    ctx.fillStyle = gold
    ctx.font = '500 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(familyName.toUpperCase(), SIZE / 2, 80)
    ctx.strokeStyle = gold
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(SIZE / 2 - 40, 104)
    ctx.lineTo(SIZE / 2 + 40, 104)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const photoSize = 400
  const cx = SIZE / 2
  const cy = SIZE / 2 - 120

  // Photo
  if (photoBuffer) {
    try {
      const photo = await loadImage(photoBuffer)
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(photo, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize)
      ctx.restore()
      ctx.strokeStyle = gold
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2 + 2, 0, Math.PI * 2)
      ctx.stroke()
    } catch {}
  }

  // Référence biblique
  ctx.fillStyle = gold
  ctx.font = '500 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(bookChapter.toUpperCase(), SIZE / 2, cy + photoSize / 2 + 60)

  // Auteur
  ctx.fillStyle = textColor
  ctx.globalAlpha = 0.8
  ctx.font = '300 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(authorName, SIZE / 2, cy + photoSize / 2 + 100)
  ctx.globalAlpha = 1

  // Parole de sagesse en bas
  if (content) {
    ctx.font = `italic 400 34px ${fontFamily}, Georgia, serif`
    ctx.textAlign = 'center'

    const maxWidth = SIZE - 160
    const words = content.split(' ')
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

    const lineH = 48
    const totalH = lines.length * lineH
    const startY = SIZE - 130 - totalH

    // Ligne déco
    ctx.strokeStyle = gold
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(SIZE / 2 - 50, startY - 24)
    ctx.lineTo(SIZE / 2 + 50, startY - 24)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.9
    lines.forEach((line, i) => {
      ctx.fillText(line, SIZE / 2, startY + i * lineH)
    })
    ctx.globalAlpha = 1
  }

  const imageBuffer = canvas.toBuffer('image/png')

  // Fichiers temporaires
  const tmpDir = path.join(os.tmpdir(), 'meditations')
  await mkdir(tmpDir, { recursive: true })

  const audioPath = path.join(tmpDir, `audio-${Date.now()}.mp3`)
  const imagePath = path.join(tmpDir, `image-${Date.now()}.png`)
  const outputPath = path.join(tmpDir, outputFilename)

  await writeFile(audioPath, audioBuffer)
  await writeFile(imagePath, imageBuffer)

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop 1'])
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest',
        '-preset ultrafast',
        '-crf 28',
        '-vf scale=1080:1080',
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run()
  })

  const videoBuffer = await readFile(outputPath)

  await Promise.all([
    unlink(audioPath).catch(() => {}),
    unlink(imagePath).catch(() => {}),
    unlink(outputPath).catch(() => {}),
  ])

  return videoBuffer
}