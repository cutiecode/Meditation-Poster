import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template introuvable' }, { status: 404 })
    }

    try {
      const filepath = path.join(process.cwd(), 'public', template.backgroundPath)
      await unlink(filepath)
    } catch {
      // Fichier déjà supprimé
    }

    await prisma.template.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}