import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE() {
  try {
    const submissions = await prisma.submission.findMany()

    // Supprime les fichiers physiques
    for (const s of submissions) {
      for (const filePath of [s.audioPath, s.photoPath]) {
        if (filePath) {
          try {
            await unlink(path.join(process.cwd(), 'public', filePath))
          } catch {}
        }
      }
    }

    await prisma.submission.deleteMany()
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}