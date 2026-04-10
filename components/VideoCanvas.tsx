'use client'

import { useRef, useState, useEffect } from 'react'

type Template = {
  id: string
  name: string
  familyName?: string | null
  backgroundPath: string
  textColor: string
  overlayOpacity: number
  fontFamily: string
}

type Submission = {
  id: string
  authorName: string
  bookChapter: string
  audioPath: string
  photoPath?: string | null
}

type Props = {
  submission: Submission
  template: Template
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function toBase64Url(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function VideoCanvas({ submission, template }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const bgImgRef = useRef<HTMLImageElement | null>(null)
  const photoImgRef = useRef<HTMLImageElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const durRef = useRef<number>(0)
  const isPlayingRef = useRef(false)

  const [genProgress, setGenProgress] = useState(0)
  const [playProgress, setPlayProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const SIZE = 540
  const gold = '#C9A84C'
  const textColor = template.textColor || '#FFFFFF'

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    prog: number,
    dur: number,
  ) => {
    const bgImg = bgImgRef.current
    const photoImg = photoImgRef.current

    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#1A1612'
    ctx.fillRect(0, 0, SIZE, SIZE)
    if (bgImg) ctx.drawImage(bgImg, 0, 0, SIZE, SIZE)

    ctx.fillStyle = `rgba(0,0,0,${template.overlayOpacity})`
    ctx.fillRect(0, 0, SIZE, SIZE)

    if (template.familyName) {
      ctx.fillStyle = gold
      ctx.font = '500 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(template.familyName.toUpperCase(), SIZE / 2, 38)
      ctx.strokeStyle = gold
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(SIZE / 2 - 20, 50)
      ctx.lineTo(SIZE / 2 + 20, 50)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const photoSize = 200
    const cx = SIZE / 2
    const cy = SIZE / 2 - 60

    if (photoImg) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(photoImg, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize)
      ctx.restore()
      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, photoSize / 2 + 1, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = gold
    ctx.font = '500 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(submission.bookChapter.toUpperCase(), SIZE / 2, cy + photoSize / 2 + 36)

    ctx.fillStyle = textColor
    ctx.globalAlpha = 0.8
    ctx.font = '300 12px sans-serif'
    ctx.fillText(submission.authorName, SIZE / 2, cy + photoSize / 2 + 54)
    ctx.globalAlpha = 1

    if (dur > 0) {
      const barY = SIZE - 50
      const barW = SIZE - 100
      const barX = 50

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.roundRect(barX, barY, barW, 3, 2)
      ctx.fill()

      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.roundRect(barX, barY, barW * prog, 3, 2)
      ctx.fill()

      const formatTime = (s: number) =>
        `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.5
      ctx.font = '300 10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(formatTime(prog * dur), barX, barY + 16)
      ctx.textAlign = 'right'
      ctx.fillText(formatTime(dur), barX + barW, barY + 16)
      ctx.globalAlpha = 1
    }
  }

  useEffect(() => {
    const preload = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      try {
        const [bgImg, photoImg] = await Promise.all([
          toBase64Url(template.backgroundPath).then(loadImage).catch(() => null),
          submission.photoPath
            ? toBase64Url(submission.photoPath).then(loadImage).catch(() => null)
            : Promise.resolve(null),
        ])
        bgImgRef.current = bgImg
        photoImgRef.current = photoImg

        const audio = new Audio(submission.audioPath)
        await new Promise<void>(resolve => {
          audio.onloadedmetadata = () => {
            durRef.current = audio.duration
            setDuration(audio.duration)
            resolve()
          }
          audio.load()
        })
        audioRef.current = audio

        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')!
        drawFrame(ctx, 0, durRef.current)
        setAssetsReady(true)
      } catch (e: any) {
        setError('Erreur de chargement : ' + e.message)
      }
    }
    preload()
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (!assetsReady) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('autostart') === 'true') {
      handleGenerate()
    }
  }, [assetsReady])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio || !assetsReady) return

    if (isPlayingRef.current) {
      audio.pause()
      cancelAnimationFrame(animFrameRef.current)
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      audio.play()
      isPlayingRef.current = true
      setIsPlaying(true)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const dur = durRef.current

      const tick = () => {
        if (!isPlayingRef.current) return
        const prog = dur > 0 ? audio.currentTime / dur : 0
        setPlayProgress(prog)
        drawFrame(ctx, prog, dur)
        if (!audio.ended) {
          animFrameRef.current = requestAnimationFrame(tick)
        } else {
          isPlayingRef.current = false
          setIsPlaying(false)
          setPlayProgress(0)
          audio.currentTime = 0
          drawFrame(ctx, 0, dur)
        }
      }
      animFrameRef.current = requestAnimationFrame(tick)

      audio.onended = () => {
        cancelAnimationFrame(animFrameRef.current)
        isPlayingRef.current = false
        setIsPlaying(false)
        setPlayProgress(0)
        audio.currentTime = 0
        drawFrame(ctx, 0, dur)
      }
    }
  }

  const handleGenerate = async () => {
    if (isGenerating) return

    audioRef.current?.pause()
    cancelAnimationFrame(animFrameRef.current)
    isPlayingRef.current = false
    setIsPlaying(false)
    setIsGenerating(true)
    setGenProgress(0)

    let prog = 0
    const interval = setInterval(() => {
      prog += Math.random() * 0.015
      if (prog > 0.92) prog = 0.92
      setGenProgress(prog)
    }, 500)

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur serveur')
      }

      const { videoUrl } = await res.json()
      setGenProgress(1)

      await new Promise(r => setTimeout(r, 300))

      const videoRes = await fetch(videoUrl)
      const blob = await videoRes.blob()
      setVideoBlob(blob)
      setIsGenerating(false)

    } catch (e: any) {
      clearInterval(interval)
      setError('Erreur : ' + e.message)
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!videoBlob) return
    const url = URL.createObjectURL(videoBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meditation-${submission.bookChapter.replace(/\s/g, '-')}.mp4`
    link.click()
  }

  const isDone = !!videoBlob

  return (
    <div className="flex flex-col items-center gap-8">

      <div style={{ position: 'relative', width: '540px' }}>
        <div style={{
          width: '540px',
          height: '540px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1A1612',
        }}>
          <canvas
            ref={canvasRef}
            width={540}
            height={540}
            style={{ width: '540px', height: '540px', display: 'block' }}
          />
        </div>

        {assetsReady && (
          <button
            onClick={handlePlayPause}
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201,168,76,0.9)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPlaying ? (
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#1A1612] font-medium">Génération en cours...</p>
            <p className="text-xs text-[#8A827A]">{Math.round(genProgress * 100)}%</p>
          </div>
          <div className="w-full bg-[#E8E0D0] rounded-full h-1.5">
            <div
              className="bg-[#C9A84C] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(genProgress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-[#C4B9AA] mt-3 text-center">
            Ne fermez pas cette page.
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 max-w-sm w-full text-center">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {!isDone && !isGenerating && assetsReady && (
          <button
            onClick={handleGenerate}
            className="w-full bg-[#1A1612] text-[#F0DFA0] py-3 rounded-xl text-sm font-medium hover:bg-[#2A2018] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Générer la vidéo
          </button>
        )}

        {isDone && (
          <button
            onClick={handleDownload}
            className="w-full bg-[#1A1612] text-[#F0DFA0] py-3 rounded-xl text-sm font-medium hover:bg-[#2A2018] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger la vidéo (MP4)
          </button>
        )}
      </div>

      {isGenerating && (
        <p className="text-xs text-[#C4B9AA] text-center max-w-sm">
          La vidéo est générée côté serveur. Cela prend environ 40 secondes.
        </p>
      )}

    </div>
  )
}