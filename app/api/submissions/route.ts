import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { uploadFile } from '../../../lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const authorName = formData.get('authorName') as string | null
    const bookChapter = formData.get('bookChapter') as string | null
    const type = formData.get('type') as string | null
    const content = formData.get('content') as string | null
    const audioFile = formData.get('audio') as File | null
    const photoFile = formData.get('photo') as File | null

    if (!authorName || !bookChapter || !type) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    if (type === 'text' && !content) {
      return NextResponse.json({ error: 'La parole de sagesse est requise' }, { status: 400 })
    }

    if (type === 'audio' && !audioFile) {
      return NextResponse.json({ error: 'Le fichier audio est requis' }, { status: 400 })
    }

    let audioPath: string | null = null
    let photoPath: string | null = null

    // Upload photo sur Supabase Storage
    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${photoFile.name.replace(/\s/g, '_')}`
      photoPath = await uploadFile('photos', filename, buffer, photoFile.type)
    }

    // Upload audio sur Supabase Storage
    if (type === 'audio' && audioFile && audioFile.size > 0) {
      const bytes = await audioFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${audioFile.name.replace(/\s/g, '_')}`
      audioPath = await uploadFile('audios', filename, buffer, audioFile.type)
    }

    const submission = await prisma.submission.create({
      data: {
        authorName,
        bookChapter,
        type,
        content: content ?? null,
        audioPath,
        photoPath,
        status: 'pending',
      },
    })

    return NextResponse.json({ id: submission.id, type: submission.type }, { status: 201 })

  } catch (err: any) {
    console.error('Erreur soumission:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(submissions)
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}