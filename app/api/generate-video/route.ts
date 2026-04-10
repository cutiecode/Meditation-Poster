import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { uploadFile } from '../../../lib/supabase'
import { generateVideo } from '../../../lib/ffmpeg'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId requis' }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission || submission.type !== 'audio') {
      return NextResponse.json({ error: 'Soumission introuvable' }, { status: 404 })
    }

    if (submission.videoPath) {
      return NextResponse.json({ videoUrl: submission.videoPath })
    }

    const template = await prisma.template.findFirst({
      where: { isActive: true },
    })

    if (!template) {
      return NextResponse.json({ error: 'Aucun template actif' }, { status: 400 })
    }

    // Télécharge l'audio
    const audioRes = await fetch(submission.audioPath!)
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

    // Télécharge l'image de fond
    const bgRes = await fetch(template.backgroundPath)
    const backgroundBuffer = Buffer.from(await bgRes.arrayBuffer())

    // Télécharge la photo si elle existe
    let photoBuffer: Buffer | null = null
    if (submission.photoPath) {
      const photoRes = await fetch(submission.photoPath)
      photoBuffer = Buffer.from(await photoRes.arrayBuffer())
    }

    // Génère la vidéo
    const videoBuffer = await generateVideo({
      audioBuffer,
      backgroundBuffer,
      photoBuffer,
      authorName: submission.authorName,
      bookChapter: submission.bookChapter,
      familyName: template.familyName,
      textColor: template.textColor,
      overlayOpacity: template.overlayOpacity,
      fontFamily: template.fontFamily,
      outputFilename: `${submissionId}.mp4`,
    })

    // Upload sur Supabase
    const videoUrl = await uploadFile(
      'videos',
      `${submissionId}.mp4`,
      videoBuffer,
      'video/mp4'
    )

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        videoPath: videoUrl,
        status: 'done',
      },
    })

    return NextResponse.json({ videoUrl })

  } catch (err: any) {
    console.error('Erreur génération vidéo:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}