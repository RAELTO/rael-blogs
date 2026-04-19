import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useCategories } from '../../features/categories/useCategories'
import { useCreatePost, useUpdatePost, type PostFormData } from '../../features/posts/usePostMutations'
import type { PostWithMeta, CoverType } from '../../features/posts/usePosts'
import { slugify } from '../../lib/utils'
import { uploadCoverImage } from '../../lib/storage'
import { supabase } from '../../lib/supabase'
import { useToast } from '../ui/Toast'
import ImageUpload from '../ui/ImageUpload'
import RichEditor from '../ui/RichEditor'
import ConfirmDialog from '../ui/ConfirmDialog'

const COVER_TYPES: { value: CoverType; label: string; desc: string }[] = [
  { value: 'gif',         label: '⬡ Animación',    desc: 'Rectángulo flotante animado' },
  { value: 'infographic', label: '▦ Infografía',   desc: 'Barras de datos' },
  { value: 'audio',       label: '▶ Audio',         desc: 'Waveform de podcast' },
  { value: 'video',       label: '▷ Video',         desc: 'Portada de vídeo' },
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  slug: z.string()
    .min(3, 'El slug es requerido')
    .max(200, 'Máximo 200 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  excerpt: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  content: z.string()
    .max(100_000, 'Contenido demasiado largo')
    .refine(
      val => stripHtml(val).split(/\s+/).filter(Boolean).length >= 10,
      'El contenido debe tener al menos 10 palabras',
    ),
  cover_image_url: z
    .string()
    .url('URL inválida')
    .startsWith('https://', 'Solo URLs HTTPS')
    .max(500, 'URL muy larga')
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  categoryIds: z.array(z.string().regex(UUID_RE, 'ID de categoría inválido'))
    .min(1, 'Selecciona al menos una categoría')
    .max(10),
  tagNames: z.string()
    .max(500, 'Lista de tags demasiado larga')
    .refine(
      val => val.trim().split(',').map(t => t.trim()).filter(Boolean).length >= 1,
      'Agrega al menos un tag',
    ),
})

type FormValues = z.infer<typeof schema>

interface PostEditorProps {
  post?: PostWithMeta
}

export default function PostEditor({ post }: PostEditorProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [coverType, setCoverType] = useState<CoverType>((post as PostWithMeta & { cover_type?: CoverType })?.cover_type ?? 'gif')
  const [clearImage, setClearImage] = useState(false)
  const [userPickedType, setUserPickedType] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{ values: FormValues; status?: 'draft' | 'published' | 'archived' } | null>(null)
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'available' | 'adjusted'>('idle')
  const [slugNote, setSlugNote] = useState<string | null>(null)
  const autoCorrectingRef = useRef(false)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: post?.content ?? '',
      cover_image_url: post?.cover_image_url ?? '',
      status: (post?.status as 'draft' | 'published' | 'archived') ?? 'draft',
      categoryIds: post?.categories.map(c => c.id) ?? [],
      tagNames: post?.tags.map(t => t.name).join(', ') ?? '',
    },
  })

  const title = watch('title')
  const slug = watch('slug')

  useEffect(() => {
    if (!post) setValue('slug', slugify(title))
  }, [title, post, setValue])

  // Slug availability check with auto-correction
  useEffect(() => {
    if (autoCorrectingRef.current) {
      autoCorrectingRef.current = false
      return
    }
    if (!slug || slug.length < 3) {
      setSlugState('idle')
      setSlugNote(null)
      return
    }

    setSlugState('checking')
    setSlugNote(null)

    const timer = setTimeout(async () => {
      const findAvailable = async (base: string): Promise<string> => {
        let candidate = base
        let counter = 2
        while (true) {
          const { data } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', candidate)
            .neq('id', post?.id ?? '')
            .maybeSingle()
          if (!data) return candidate
          candidate = `${base}-${counter++}`
        }
      }

      const available = await findAvailable(slug)
      if (available === slug) {
        setSlugState('available')
        setSlugNote(null)
      } else {
        autoCorrectingRef.current = true
        setValue('slug', available, { shouldValidate: true })
        setSlugState('adjusted')
        setSlugNote(`"${slug}" ya existía → ajustado a "${available}"`)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [slug, post?.id, setValue])

  const hasCoverImage = !!coverFile || (!!post?.cover_image_url && !clearImage)
  const coverConflict = hasCoverImage && userPickedType

  const onSubmit = (values: FormValues, status?: 'draft' | 'published' | 'archived') => {
    if (coverConflict) {
      setPendingSubmit({ values, status })
      return
    }
    void doSubmit(values, status, false)
  }

  const doSubmit = async (values: FormValues, status?: 'draft' | 'published' | 'archived', forceGeneratedType = false) => {
    if (!user) return
    setUploadingImage(true)

    let coverUrl = ''
    if (!forceGeneratedType && !clearImage) {
      try {
        if (coverFile) {
          coverUrl = await uploadCoverImage(coverFile, user.id)
        } else {
          coverUrl = values.cover_image_url ?? ''
        }
      } catch {
        toast('⚠ Error al subir la imagen. Intenta de nuevo.')
        setUploadingImage(false)
        return
      }
    }
    setUploadingImage(false)

    const formData: PostFormData = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt ?? '',
      content: values.content,
      cover_image_url: coverUrl,
      cover_type: coverUrl ? 'image' : coverType,
      status: status ?? values.status,
      categoryIds: values.categoryIds,
      tagNames: values.tagNames.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
    }

    try {
      if (post) {
        await updatePost.mutateAsync({ id: post.id, form: formData })
        toast('Post actualizado')
      } else {
        await createPost.mutateAsync(formData)
        toast(formData.status === 'published' ? '⚡ Publicado' : 'Borrador guardado')
        if (formData.status === 'published') navigate(`/post/${values.slug}`)
        else navigate('/dashboard/posts')
        return
      }
      navigate('/dashboard/posts')
    } catch (e: unknown) {
      toast(`⚠ Error: ${e instanceof Error ? e.message : 'Error inesperado'}`)
    }
  }

  const isLoading = createPost.isPending || updatePost.isPending || uploadingImage

  return (
    <div className="page">
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'color-mix(in oklab, var(--bg) 70%, transparent)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, backdropFilter: 'blur(2px)',
        }}>
          <div className="spinner"><div className="spinner-ring" /></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
            {uploadingImage ? 'subiendo imagen…' : createPost.isPending ? 'publicando…' : 'guardando…'}
          </div>
        </div>
      )}
      <div className="row between items-center mb-5 wrap gap-3">
        <div>
          <div className="text-xs text-mute uppercase" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}>
            {post ? 'Editando' : 'Nuevo'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, margin: '6px 0 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-2)', border: '3px solid var(--ink)', padding: '0 10px', boxShadow: '4px 4px 0 var(--ink)', display: 'inline-block' }}>
              Editor
            </span>
          </h1>
        </div>
        <div className="row gap-2">
          <button type="button" className="btn" onClick={() => navigate('/dashboard/posts')} disabled={isLoading}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleSubmit(v => onSubmit(v, 'draft'))}
            disabled={isLoading}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(v => onSubmit(v, 'published'))}
            disabled={isLoading}
          >
            <Icon name="bolt" size={14} /> {post?.status === 'published' ? 'Actualizar' : 'Publicar'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(v => onSubmit(v))}>
        <div className="two-col">
          <div>
            <div className="field-group">
              <label className="field-label">Título</label>
              <input
                {...register('title')}
                placeholder="Un título que te llame la atención"
                style={{ fontSize: 22, padding: '14px 16px' }}
              />
              {errors.title && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.title.message}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Slug (URL)</label>
              <input {...register('slug')} placeholder="mi-primer-post" style={{ fontFamily: 'var(--font-mono)' }} />
              {errors.slug && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.slug.message}</p>}
              {!errors.slug && slugState === 'checking' && (
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>verificando disponibilidad…</p>
              )}
              {!errors.slug && slugState === 'available' && (
                <p style={{ fontSize: 11, marginTop: 4, color: '#2d9e2d', fontFamily: 'var(--font-mono)' }}>✓ disponible</p>
              )}
              {!errors.slug && slugState === 'adjusted' && slugNote && (
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--accent-1)', fontFamily: 'var(--font-mono)' }}>⚡ {slugNote}</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">Resumen / Excerpt</label>
              <textarea rows={2} {...register('excerpt')} placeholder="Una línea que explique por qué vale la pena leer este post." />
              {errors.excerpt && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.excerpt.message}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Contenido</label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Escribe aquí… Usa el toolbar para dar formato."
                  />
                )}
              />
              {errors.content && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.content.message}</p>}
            </div>
          </div>

          <aside>
            <div className="sidebar-block">
              <h4>Portada</h4>
              <ImageUpload
                kind="cover"
                currentUrl={clearImage ? undefined : post?.cover_image_url}
                onFile={file => { setCoverFile(file); if (file) setClearImage(false) }}
                uploading={uploadingImage}
              />
              {post?.cover_image_url && !coverFile && !clearImage && (
                <button
                  type="button"
                  className="btn btn-small"
                  style={{ width: '100%', marginTop: 8, color: 'var(--accent-1)', justifyContent: 'center' }}
                  onClick={() => { setClearImage(true); setUserPickedType(false) }}
                >
                  ✕ Eliminar portada
                </button>
              )}
              {!coverFile && (!post?.cover_image_url || clearImage) && (
                <div style={{ marginTop: 16 }}>
                  <div className="field-label" style={{ marginBottom: 8 }}>Tipo de portada generada</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {COVER_TYPES.map((ct, i) => {
                      const active = coverType === ct.value
                      return (
                        <button
                          key={ct.value}
                          type="button"
                          onClick={() => { setCoverType(ct.value); setUserPickedType(true) }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px',
                            border: '2px solid var(--ink)',
                            borderTop: i === 0 ? '2px solid var(--ink)' : 'none',
                            background: active ? 'var(--accent-2)' : 'var(--bg-panel)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxShadow: active ? 'inset 3px 3px 0 var(--ink)' : 'none',
                            transition: 'background .1s',
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, flexShrink: 0,
                            border: '2px solid var(--ink)',
                            background: active ? 'var(--ink)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {active && <span style={{ color: 'var(--bg-panel)', fontSize: 10, lineHeight: 1 }}>✓</span>}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{ct.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{ct.desc}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-block">
              <h4>Categorías</h4>
              {categories.length === 0 && (
                <div className="text-xs text-mute">Sin categorías. Agrégalas desde Supabase.</div>
              )}
              {categories.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value={c.id}
                    style={{ width: 'auto', boxShadow: 'none' }}
                    {...register('categoryIds')}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                </label>
              ))}
              {errors.categoryIds && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.categoryIds.message}</p>}
            </div>

            <div className="sidebar-block">
              <h4>Tags</h4>
              <input {...register('tagNames')} placeholder="transmedia, lógica, falacia" />
              <div className="text-xs text-mute mt-3">Separa con comas. Sin almohadillas.</div>
              {errors.tagNames && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.tagNames.message}</p>}
            </div>

            <div className="sidebar-block">
              <h4>Estado</h4>
              <select {...register('status')}>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </aside>
        </div>
      </form>

      <ConfirmDialog
        open={!!pendingSubmit}
        title="Conflicto de portada"
        message={
          post?.cover_image_url && !clearImage
            ? `Seleccionaste el tipo "${COVER_TYPES.find(ct => ct.value === coverType)?.label ?? coverType}". Si continúas, la imagen actual se eliminará.`
            : `Seleccionaste el tipo "${COVER_TYPES.find(ct => ct.value === coverType)?.label ?? coverType}". Si continúas, la imagen subida no se guardará.`
        }
        confirmLabel="Sí, usar tipo generado"
        cancelLabel="Mantener imagen"
        onConfirm={() => {
          if (pendingSubmit) {
            void doSubmit(pendingSubmit.values, pendingSubmit.status, true)
            setPendingSubmit(null)
          }
        }}
        onCancel={() => setPendingSubmit(null)}
      />
    </div>
  )
}
