import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { uploadFile } from '../../../../lib/supabase'

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get('name') as string
    const familyName = formData.get('familyName') as string | null
    const textColor = formData.get('textColor') as string
    const textPosition = formData.get('textPosition') as string
    const overlayOpacity = parseFloat(formData.get('overlayOpacity') as string)
    const fontFamily = formData.get('fontFamily') as string
    const bgFile = formData.get('background') as File | null

    if (!name || !bgFile) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const bytes = await bgFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${bgFile.name.replace(/\s/g, '_')}`
    const backgroundPath = await uploadFile('backgrounds', filename, buffer, bgFile.type)

    const template = await prisma.template.create({
      data: {
        name,
        familyName: familyName || null,
        backgroundPath,
        textColor,
        textPosition,
        overlayOpacity,
        fontFamily,
        isActive: false,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}