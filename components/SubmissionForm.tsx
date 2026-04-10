'use client'

import { useState, useRef } from 'react'

const BIBLE_BOOKS_CHAPTERS: Record<string, number> = {
  'Genèse': 50, 'Exode': 40, 'Lévitique': 27, 'Nombres': 36, 'Deutéronome': 34,
  'Josué': 24, 'Juges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Rois': 22, '2 Rois': 25, '1 Chroniques': 29, '2 Chroniques': 36,
  'Esdras': 10, 'Néhémie': 13, 'Esther': 10, 'Job': 42, 'Psaumes': 150,
  'Proverbes': 31, 'Ecclésiaste': 12, 'Cantique des Cantiques': 8,
  'Ésaïe': 66, 'Jérémie': 52, 'Lamentations': 5, 'Ézéchiel': 48,
  'Daniel': 12, 'Osée': 14, 'Joël': 3, 'Amos': 9, 'Abdias': 1,
  'Jonas': 4, 'Michée': 7, 'Nahoum': 3, 'Habacuc': 3, 'Sophonie': 3,
  'Aggée': 2, 'Zacharie': 14, 'Malachie': 4,
  'Matthieu': 28, 'Marc': 16, 'Luc': 24, 'Jean': 21, 'Actes': 28,
  'Romains': 16, '1 Corinthiens': 16, '2 Corinthiens': 13, 'Galates': 6,
  'Éphésiens': 6, 'Philippiens': 4, 'Colossiens': 4,
  '1 Thessaloniciens': 5, '2 Thessaloniciens': 3,
  '1 Timothée': 6, '2 Timothée': 4, 'Tite': 3, 'Philémon': 1,
  'Hébreux': 13, 'Jacques': 5, '1 Pierre': 5, '2 Pierre': 3,
  '1 Jean': 5, '2 Jean': 1, '3 Jean': 1, 'Jude': 1, 'Apocalypse': 22,
}

type SubmissionType = 'text' | 'audio'

export default function SubmissionForm() {
  const [type, setType] = useState<SubmissionType>('text')
  const [authorName, setAuthorName] = useState('')
  const [book, setBook] = useState('')
  const [chapter, setChapter] = useState('')
  const [content, setContent] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ id: string; type: string } | null>(null)
  const [error, setError] = useState('')
  const [chapterError, setChapterError] = useState('')
  const audioRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const maxChapter = book ? BIBLE_BOOKS_CHAPTERS[book] : 150

  const handleChapterChange = (val: string) => {
    setChapterError('')
    if (!/^\d*$/.test(val)) return
    const num = parseInt(val)
    if (val !== '' && num < 1) return
    if (val !== '' && num > maxChapter) {
      setChapterError(`${book} n'a que ${maxChapter} chapitre${maxChapter > 1 ? 's' : ''}`)
      setChapter(val)
      return
    }
    setChapter(val)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (chapterError) return
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('authorName', authorName)
      formData.append('bookChapter', `${book} ${chapter}`)
      formData.append('type', type)

      formData.append('content', content)
      if (type === 'audio' && audioFile) {
        formData.append('audio', audioFile)
      }

      if (photoFile) {
        formData.append('photo', photoFile)
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Une erreur est survenue')
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setAuthorName('')
    setBook('')
    setChapter('')
    setContent('')
    setAudioFile(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setType('text')
    if (audioRef.current) audioRef.current.value = ''
    if (photoRef.current) photoRef.current.value = ''
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0D0] p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#F0DFA0] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#8A6A1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#1A1612] mb-3">
            Méditation reçue
          </h2>
          <p className="text-[#8A827A] text-sm mb-8">
            Votre méditation a été soumise avec succès.
          </p>
          <a
            href={result.type === 'text' ? `/poster/${result.id}` : `/video/${result.id}?autostart=true`}
            className="block w-full bg-[#1A1612] text-[#F0DFA0] py-3 rounded-xl text-sm font-medium mb-3 hover:bg-[#2A2018] transition-colors"
          >
            {result.type === 'text' ? 'Voir mon affiche' : 'Afficher ma vidéo'}
          </a>
          
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-[#C9A84C] mb-3">
            Famille Simon MSA
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-[#1A1612] mb-3">
            Soumettre une méditation
          </h1>
          <p className="text-[#8A827A] text-sm leading-relaxed">
            Partagez votre parole. Votre méditation sera générée automatiquement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E8E0D0] p-8 space-y-6">

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-3">
              Type de méditation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                  type === 'text'
                    ? 'bg-[#1A1612] text-[#F0DFA0] border-[#1A1612]'
                    : 'bg-white text-[#8A827A] border-[#E8E0D0] hover:border-[#C9A84C]'
                }`}
              >
                Texte → Affiche
              </button>
              <button
                type="button"
                onClick={() => setType('audio')}
                className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                  type === 'audio'
                    ? 'bg-[#1A1612] text-[#F0DFA0] border-[#1A1612]'
                    : 'bg-white text-[#8A827A] border-[#E8E0D0] hover:border-[#C9A84C]'
                }`}
              >
                Audio → Vidéo
              </button>
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
              Votre photo <span className="text-[#C4B9AA] normal-case tracking-normal">(optionnel)</span>
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-16 h-16 rounded-full border-2 border-dashed border-[#E8E0D0] flex items-center justify-center cursor-pointer hover:border-[#C9A84C] transition-colors overflow-hidden flex-shrink-0"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="photo" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-[#C4B9AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm text-[#8A827A]">
                  {photoPreview ? 'Photo sélectionnée' : 'Cliquez pour ajouter votre photo'}
                </p>
                <p className="text-xs text-[#C4B9AA] mt-0.5">Elle apparaîtra sur l'affiche</p>
              </div>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
              Votre nom
            </label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              required
              placeholder="Frère / Sœur..."
              className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder-[#C4B9AA] focus:outline-none focus:border-[#C9A84C] transition-colors bg-white"
            />
          </div>

          {/* Livre + Chapitre */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                Livre biblique
              </label>
              <select
                value={book}
                onChange={e => { setBook(e.target.value); setChapter(''); setChapterError('') }}
                required
                className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#C9A84C] transition-colors bg-white"
              >
                <option value="">Choisir...</option>
                {Object.keys(BIBLE_BOOKS_CHAPTERS).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                Chapitre
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={chapter}
                onChange={e => handleChapterChange(e.target.value)}
                required
                placeholder={book ? `1-${maxChapter}` : '...'}
                disabled={!book}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder-[#C4B9AA] focus:outline-none transition-colors bg-white disabled:opacity-40 disabled:cursor-not-allowed ${
                  chapterError ? 'border-red-300 focus:border-red-400' : 'border-[#E8E0D0] focus:border-[#C9A84C]'
                }`}
              />
              {chapterError && (
                <p className="text-xs text-red-400 mt-1">{chapterError}</p>
              )}
            </div>
          </div>

          {/* Parole de sagesse — pour les deux types */}
          <div>
            <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
              Parole de sagesse
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required={type === 'text'}
              rows={3}
              maxLength={120}
              placeholder="Une phrase courte et inspirante..."
              className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder-[#C4B9AA] focus:outline-none focus:border-[#C9A84C] transition-colors bg-white resize-none leading-relaxed"
            />
            <p className="text-xs text-[#C4B9AA] text-right mt-1">{content.length}/120</p>
          </div>

          {type === 'audio' && (
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                Fichier audio (max 5 min)
              </label>
              <div
                onClick={() => audioRef.current?.click()}
                className="w-full border-2 border-dashed border-[#E8E0D0] rounded-xl px-4 py-8 text-center cursor-pointer hover:border-[#C9A84C] transition-colors"
              >
                {audioFile ? (
                  <p className="text-sm text-[#1A1612] font-medium">{audioFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-[#8A827A]">Cliquez pour choisir un fichier</p>
                    <p className="text-xs text-[#C4B9AA] mt-1">MP3, WAV, M4A acceptés</p>
                  </>
                )}
              </div>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const audio = new Audio(URL.createObjectURL(file))
                  audio.onloadedmetadata = () => {
                    if (audio.duration > 300) {
                      setError('L\'audio ne doit pas dépasser 5 minutes')
                      if (audioRef.current) audioRef.current.value = ''
                    } else {
                      setError('')
                      setAudioFile(file)
                    }
                  }
                }}
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !!chapterError}
            className="w-full bg-[#1A1612] text-[#F0DFA0] py-4 rounded-xl text-sm font-medium hover:bg-[#2A2018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Génération en cours...' : 'Générer mon affiche'}
          </button>

        </form>

        <p className="text-center text-xs text-[#C4B9AA] mt-6">
          Que ta parole soit une lumière sur nos pas
        </p>

      </div>
    </div>
  )
}