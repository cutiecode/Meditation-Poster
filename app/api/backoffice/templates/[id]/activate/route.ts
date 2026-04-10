import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.template.updateMany({
      data: { isActive: false },
    })

    await prisma.template.update({
      where: { id },
      data: { isActive: true },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}