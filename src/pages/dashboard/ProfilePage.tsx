import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings2 } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile, useUpdateProfile } from '../../features/profile/useProfile'
import { uploadAvatarImage } from '../../lib/storage'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import ImageUpload from '../../components/ui/ImageUpload'
import Avatar from '../../components/ui/Avatar'
import AppearanceModal from '../../components/ui/AppearanceModal'
import { useToast } from '../../components/ui/Toast'

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guión bajo'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const { data: profile, isLoading } = useProfile(user?.id)
  const updateProfile = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const appearanceBtnRef = useRef<HTMLButtonElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '', username: '', bio: '' },
  })

  useEffect(() => {
    if (profile) reset({
      display_name: profile.display_name,
      username: profile.username,
      bio: profile.bio ?? '',
    })
  }, [profile, reset])

  const onSubmit = async (values: FormValues) => {
    if (!user || !profile) return
    setUploading(true)
    try {
      let avatarUrl = profile.avatar_url ?? ''
      if (avatarFile) avatarUrl = await uploadAvatarImage(avatarFile, user.id)
      await updateProfile.mutateAsync({
        userId: user.id,
        form: { ...values, bio: values.bio ?? '', avatar_url: avatarUrl },
      })
      toast('Perfil actualizado ✓')
    } catch (e: unknown) {
      toast(`⚠ ${e instanceof Error ? e.message : 'Error inesperado'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      {isLoading ? (
        <div className="spinner">
          <div className="spinner-ring" />
          <span className="spinner-label">▒ cargando perfil...</span>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="profile-cover mb-4" />
          <div className="profile-header-row">
            <Avatar
              name={profile?.display_name ?? user?.email ?? 'U'}
              src={profile?.avatar_url}
              size="lg"
            />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {profile?.display_name}
              </div>
              <div className="text-mute" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                @{profile?.username}
              </div>
            </div>
          </div>

          {/* Apariencia — visible siempre (especialmente útil en móvil donde el sidebar está oculto) */}
          <div className="panel" style={{ padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-mute)', marginBottom: 2 }}>
                Apariencia
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
                Paleta de color y sombras
              </div>
            </div>
            <button
              ref={appearanceBtnRef}
              className="btn"
              onClick={() => setAppearanceOpen(o => !o)}
              style={{ gap: 6 }}
            >
              <Settings2 size={15} strokeWidth={2.5} /> Personalizar
            </button>
          </div>

          {/* Edit form */}
          <div className="panel" style={{ padding: 24, marginBottom: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>▸ My Box</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="two-col">
                <div>
                  <div className="field-group">
                    <label className="field-label">Nombre público</label>
                    <input {...register('display_name')} placeholder="Tu nombre" />
                    {errors.display_name && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.display_name.message}</p>}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <input {...register('username')} placeholder="tu_usuario" style={{ fontFamily: 'var(--font-mono)' }} />
                    {errors.username && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.username.message}</p>}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Bio</label>
                    <textarea rows={3} {...register('bio')} placeholder="Cuéntale al mundo quién eres…" />
                    {errors.bio && <p style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 4 }}>{errors.bio.message}</p>}
                  </div>

                  <div className="row gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={uploading || updateProfile.isPending}
                    >
                      {uploading || updateProfile.isPending ? '▒ guardando...' : '✓ Guardar'}
                    </button>
                  </div>
                </div>

                <aside>
                  <div className="sidebar-block">
                    <h4>Avatar</h4>
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
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </>
      )}

      {appearanceOpen && (
        <AppearanceModal
          anchorRef={appearanceBtnRef}
          onClose={() => setAppearanceOpen(false)}
        />
      )}
    </AppShell>
  )
}
