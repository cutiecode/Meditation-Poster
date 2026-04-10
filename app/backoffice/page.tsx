'use client'

import { useState, useEffect } from 'react'

type Submission = {
  id: string
  createdAt: string
  authorName: string
  bookChapter: string
  type: string
  status: string
  content: string | null
  audioPath: string | null
  photoPath: string | null
}

export default function BackofficePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const fetchSubmissions = async () => {
    const res = await fetch('/api/submissions')
    const data = await res.json()
    setSubmissions(data)
    setLoading(false)
  }

  useEffect(() => { fetchSubmissions() }, [])

  const handleClearAll = async () => {
    if (!confirm('Supprimer toutes les soumissions ? Cette action est irréversible.')) return
    setClearing(true)
    await fetch('/api/submissions/clear', { method: 'DELETE' })
    setSubmissions([])
    setClearing(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9A84C] mb-3">
            Administration
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-[#1A1612] mb-2">
            Back-office
          </h1>
          <p className="text-[#8A827A] text-sm">
            Gérez les templates et suivez les soumissions.
          </p>
        </div>

        {/* Card navigation */}
        <div className="mb-12">
          <a
            href="/backoffice/templates"
            className="bg-white rounded-2xl border border-[#E8E0D0] p-6 hover:border-[#C9A84C] transition-colors group inline-block w-full max-w-sm"
          >
            <div className="w-10 h-10 bg-[#F0DFA0] rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#8A6A1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#1A1612] mb-1 group-hover:text-[#C9A84C] transition-colors">
              Templates d'affiches
            </h2>
            <p className="text-[#8A827A] text-sm">
              Uploadez vos fonds bibliques et activez un template.
            </p>
          </a>
        </div>

        {/* Soumissions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#1A1612]">
              Soumissions récentes
            </h2>
            <button
              onClick={handleClearAll}
              disabled={clearing || submissions.length === 0}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {clearing ? 'Suppression...' : 'Tout supprimer'}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#8A827A]">Chargement...</p>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E0D0] p-10 text-center">
              <p className="text-sm text-[#8A827A]">Aucune soumission pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-[#E8E0D0] p-5 flex items-start gap-5"
                >
                  {/* Miniature */}
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      backgroundColor: '#1A1612',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                    }}
                  >
                    {s.photoPath ? (
                      <>
                        <img
                          src={s.photoPath}
                          alt={s.authorName}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.4,
                          }}
                        />
                        <div style={{
                          position: 'relative',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '1.5px solid #C9A84C',
                          flexShrink: 0,
                          marginBottom: '4px',
                        }}>
                          <img
                            src={s.photoPath}
                            alt={s.authorName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </>
                    ) : (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '1.5px solid #C9A84C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                      }}>
                        {s.type === 'audio' ? (
                          <svg width="12" height="12" fill="#C9A84C" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" fill="#C9A84C" viewBox="0 0 24 24">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        )}
                      </div>
                    )}
                    <p style={{
                      position: 'relative',
                      color: '#C9A84C',
                      fontSize: '7px',
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.bookChapter}
                    </p>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.type === 'text'
                            ? 'bg-[#E8F4E8] text-[#2D6A2D]'
                            : 'bg-[#E8EEF4] text-[#2D4A6A]'
                        }`}>
                          {s.type === 'text' ? 'Affiche' : 'Vidéo'}
                        </div>
                        <p className="text-sm font-medium text-[#1A1612]">{s.authorName}</p>
                        <p className="text-xs text-[#C9A84C] font-medium">{s.bookChapter}</p>
                      </div>
                      <p className="text-xs text-[#C4B9AA] flex-shrink-0">{formatDate(s.createdAt)}</p>
                    </div>

                    {s.content && (
                      <p className="text-xs text-[#8A827A] mt-2 line-clamp-2 leading-relaxed italic">
                        "{s.content}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      {s.type === 'text' && (
                        <a
                          href={`/poster/${s.id}`}
                          target="_blank"
                          className="text-xs text-[#C9A84C] hover:text-[#8A6A1F] font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Télécharger l'affiche
                        </a>
                      )}
                      {s.type === 'audio' && (
                        <a
                          href={`/video/${s.id}`}
                          target="_blank"
                          className="text-xs text-[#C9A84C] hover:text-[#8A6A1F] font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Générer et télécharger
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}