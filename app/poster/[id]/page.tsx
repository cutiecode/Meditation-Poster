import { prisma } from '../../../lib/prisma'
import { notFound } from 'next/navigation'
import PosterCanvas from '../../../components/PosterCanvas'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PosterPage({ params }: Props) {
  const { id } = await params

  const submission = await prisma.submission.findUnique({
    where: { id },
  })

  if (!submission || submission.type !== 'text') {
    notFound()
  }

  const template = await prisma.template.findFirst({
    where: { isActive: true },
  })

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9A84C] mb-3">
            Méditation générée
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-[#1A1612] mb-3">
            {submission.bookChapter}
          </h1>
          <p className="text-[#8A827A] text-sm">
            par {submission.authorName}
          </p>
        </div>

        {template ? (
          <PosterCanvas
            submission={{
              id: submission.id,
              authorName: submission.authorName,
              bookChapter: submission.bookChapter,
              content: submission.content || '',
              photoPath: submission.photoPath,
            }}
            template={template}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E0D0] p-10 text-center">
            <p className="text-[#8A827A] text-sm mb-2">Aucun template actif</p>
            <p className="text-[#C4B9AA] text-xs">
              Un administrateur doit d'abord activer un template dans le back-office.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8A827A] hover:text-[#1A1612] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </a>
        </div>

      </div>
    </div>
  )
}