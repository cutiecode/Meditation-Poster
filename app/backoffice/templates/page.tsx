'use client'

import { useState, useEffect, useRef } from 'react'

type Template = {
  id: string
  name: string
  backgroundPath: string
  textColor: string
  textPosition: string
  overlayOpacity: number
  fontFamily: string
  isActive: boolean
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
  name: '',
  familyName: '',
  textColor: '#FFFFFF',
  textPosition: 'bottom',
  overlayOpacity: '0.4',
  fontFamily: 'Cormorant Garamond',
})
  const [bgFile, setBgFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const fetchTemplates = async () => {
    const res = await fetch('/api/backoffice/templates')
    const data = await res.json()
    setTemplates(data)
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBgFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!bgFile) return setError('Veuillez choisir une image de fond')
  setUploading(true)
  setError('')

  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('familyName', form.familyName)
    formData.append('textColor', form.textColor)
    formData.append('textPosition', form.textPosition)
    formData.append('overlayOpacity', form.overlayOpacity)
    formData.append('fontFamily', form.fontFamily)
    formData.append('background', bgFile)

    const res = await fetch('/api/backoffice/templates', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Erreur lors de la création')

    setForm({ name: '', familyName: '', textColor: '#FFFFFF', textPosition: 'bottom', overlayOpacity: '0.4', fontFamily: 'Cormorant Garamond' })
    setBgFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    fetchTemplates()
  } catch (err: any) {
    setError(err.message)
  } finally {
    setUploading(false)
  }
}
  

  const handleActivate = async (id: string) => {
    await fetch(`/api/backoffice/templates/${id}/activate`, { method: 'POST' })
    fetchTemplates()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce template ?')) return
    await fetch(`/api/backoffice/templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <a href="/backoffice" className="text-xs text-[#C4B9AA] hover:text-[#8A827A] transition-colors">
            ← Back-office
          </a>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-[#1A1612] mt-3 mb-2">
            Templates d'affiches
          </h1>
          <p className="text-[#8A827A] text-sm">
            Uploadez vos fonds bibliques et configurez la mise en page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Formulaire ajout */}
          <div className="bg-white rounded-2xl border border-[#E8E0D0] p-6">
            <h2 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#1A1612] mb-6">
              Nouveau template
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="ex: Aube dorée"
                  className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder-[#C4B9AA] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                  Nom de la famille
                </label>
                <input
                  type="text"
                  value={form.familyName}
                  onChange={e => setForm({ ...form, familyName: e.target.value })}
                  placeholder="ex: Famille Béthel"
                  className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] placeholder-[#C4B9AA] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>

              {/* Image de fond */}
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                  Image de fond
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#E8E0D0] rounded-xl overflow-hidden cursor-pointer hover:border-[#C9A84C] transition-colors"
                  style={{ height: '140px' }}
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-sm text-[#8A827A]">Cliquez pour choisir</p>
                      <p className="text-xs text-[#C4B9AA] mt-1">JPG, PNG recommandé 1080×1080</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Couleur texte */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                    Couleur du texte
                  </label>
                  <div className="flex items-center gap-3 border border-[#E8E0D0] rounded-xl px-4 py-3">
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={e => setForm({ ...form, textColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-sm text-[#1A1612]">{form.textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                    Position texte
                  </label>
                  <select
                    value={form.textPosition}
                    onChange={e => setForm({ ...form, textPosition: e.target.value })}
                    className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="top">Haut</option>
                    <option value="center">Centre</option>
                    <option value="bottom">Bas</option>
                  </select>
                </div>
              </div>

              {/* Opacité overlay */}
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                  Opacité overlay — {Math.round(parseFloat(form.overlayOpacity) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.05"
                  value={form.overlayOpacity}
                  onChange={e => setForm({ ...form, overlayOpacity: e.target.value })}
                  className="w-full accent-[#C9A84C]"
                />
              </div>

              {/* Police */}
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase text-[#8A827A] mb-2">
                  Police
                </label>
                <select
                  value={form.fontFamily}
                  onChange={e => setForm({ ...form, fontFamily: e.target.value })}
                  className="w-full border border-[#E8E0D0] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Palatino">Palatino</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#1A1612] text-[#F0DFA0] py-3 rounded-xl text-sm font-medium hover:bg-[#2A2018] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Upload en cours...' : 'Ajouter ce template'}
              </button>

            </form>
          </div>

          {/* Liste templates */}
          <div className="space-y-4">
            <h2 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#1A1612]">
              Templates existants
            </h2>

            {loading ? (
              <p className="text-sm text-[#8A827A]">Chargement...</p>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-8 text-center">
                <p className="text-sm text-[#8A827A]">Aucun template pour l'instant</p>
              </div>
            ) : (
              templates.map(t => (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl border p-4 flex gap-4 items-start ${
                    t.isActive ? 'border-[#C9A84C]' : 'border-[#E8E0D0]'
                  }`}
                >
                  {/* Miniature */}
                  <div
                    className="rounded-xl overflow-hidden flex-shrink-0"
                    style={{ width: '80px', height: '80px', backgroundColor: '#1A1612' }}
                  >
                    <img
                      src={t.backgroundPath}
                      alt={t.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[#1A1612] truncate">{t.name}</p>
                      {t.isActive && (
                        <span className="text-xs bg-[#F0DFA0] text-[#8A6A1F] px-2 py-0.5 rounded-full flex-shrink-0">
                          Actif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8A827A]">{t.fontFamily} · texte {t.textPosition}</p>
                    <p className="text-xs text-[#C4B9AA]">overlay {Math.round(t.overlayOpacity * 100)}%</p>

                    <div className="flex gap-3 mt-3">
                      {!t.isActive && (
                        <button
                          onClick={() => handleActivate(t.id)}
                          className="text-xs text-[#C9A84C] hover:text-[#8A6A1F] font-medium transition-colors"
                        >
                          Activer
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-xs text-[#C4B9AA] hover:text-red-400 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}