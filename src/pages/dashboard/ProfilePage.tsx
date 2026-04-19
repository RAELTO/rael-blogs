import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile, useUpdateProfile } from '../../features/profile/useProfile'
import { uploadAvatarImage } from '../../lib/storage'
import AppLayout from '../../components/layout/AppLayout'
import ImageUpload from '../../components/ui/ImageUpload'
import { useToast } from '../../components/ui/Toast'

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guiones bajos'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: profile, isLoading } = useProfile(user?.id)
  const updateProfile = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '', username: '', bio: '' },
  })

  useEffect(() => {
    if (profile) reset({ display_name: profile.display_name, username: profile.username, bio: profile.bio ?? '' })
  }, [profile, reset])

  const onSubmit = async (values: FormValues) => {
    if (!user || !profile) return
    setUploading(true)

    try {
      let avatarUrl = profile.avatar_url ?? ''

      if (avatarFile) {
        avatarUrl = await uploadAvatarImage(avatarFile, user.id)
      }

      await updateProfile.mutateAsync({
        userId: user.id,
        form: { ...values, bio: values.bio ?? '', avatar_url: avatarUrl },
      })

      toast('Perfil actualizado')
      navigate('/dashboard')
    } catch (e: unknown) {
      toast(`⚠ ${e instanceof Error ? e.message : 'Error inesperado'}`)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="page" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ▒ cargando perfil...
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-5" onClick={() => navigate('/dashboard')}>
          ← Volver al panel
        </button>

        <div className="mb-6">
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>▓ tu cuenta</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '8px 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-2)', border: '3px solid var(--ink)', padding: '0 12px', boxShadow: '5px 5px 0 var(--ink)', display: 'inline-block' }}>
              Editar perfil
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="two-col">
            <div>
              <div className="field-group">
                <label className="field-label">Nombre público</label>
                <input {...register('display_name')} placeholder="John Doe" />
                {errors.display_name && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.display_name.message}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Usuario</label>
                <input {...register('username')} placeholder="john_doe33" style={{ fontFamily: 'var(--font-mono)' }} />
                {errors.username && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.username.message}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Biografía</label>
                <textarea rows={4} {...register('bio')} placeholder="Arqueóloga de historias multimedia…" />
                {errors.bio && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.bio.message}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || updateProfile.isPending}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {uploading || updateProfile.isPending ? '▒ guardando...' : '✓ Guardar cambios'}
              </button>
            </div>

            <aside>
              <div className="sidebar-block">
                <h4>Foto de perfil</h4>
                <ImageUpload
                  kind="avatar"
                  currentUrl={profile?.avatar_url}
                  onFile={setAvatarFile}
                  uploading={uploading}
                />
              </div>

              <div className="sidebar-block">
                <h4>Correo</h4>
                <div className="text-sm text-dim" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
                <div className="text-xs text-mute mt-3">El correo no se puede cambiar desde aquí.</div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
