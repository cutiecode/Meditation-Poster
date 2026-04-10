import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-zA-Z0-9._-]/g, '_') // remplace les caractères spéciaux par _
    .replace(/_+/g, '_') // évite les doubles underscores
    .toLowerCase()
}

export async function uploadFile(
  bucket: string,
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const parts = filePath.split('-')
  const timestamp = parts[0]
  const rest = parts.slice(1).join('-')
  const cleanPath = `${timestamp}-${sanitizeFilename(rest)}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(cleanPath, buffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath)
  return data.publicUrl
}