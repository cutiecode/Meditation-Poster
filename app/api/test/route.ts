import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const url = `file:${dbPath}`.replace(/\\/g, '/')
  return NextResponse.json({ cwd: process.cwd(), dbPath, url })
}
