import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import { sanitizeText, sanitizeTagName } from '../../lib/sanitize'
import type { CoverType } from './usePosts'

function sanitizeForm(form: PostFormData): PostFormData {
  return {
    ...form,
    title: sanitizeText(form.title).slice(0, 200),
    slug: slugify(sanitizeText(form.slug)).slice(0, 200),
    excerpt: sanitizeText(form.excerpt).slice(0, 500),
    content: sanitizeText(form.content).slice(0, 100_000),
    cover_image_url: sanitizeText(form.cover_image_url).slice(0, 500),
    tagNames: form.tagNames.map(sanitizeTagName).filter(Boolean).slice(0, 10),
    // categoryIds son UUIDs validados por la DB — no necesitan sanitización adicional
  }
}

export interface PostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  cover_type: CoverType
  status: 'draft' | 'published' | 'archived'
  categoryIds: string[]
  tagNames: string[]
}

async function upsertTags(tagNames: string[]): Promise<string[]> {
  if (!tagNames.length) return []
  const ids: string[] = []
  for (const name of tagNames) {
    const slug = slugify(sanitizeTagName(name))
    const { data: existing } = await supabase.from('tags').select('id').eq('slug', slug).maybeSingle()
    if (existing) {
      ids.push(existing.id)
    } else {
      const { data: created, error } = await supabase.from('tags').insert({ name, slug }).select('id').single()
      if (error) throw error
      ids.push(created.id)
    }
  }
  return ids
}

async function createPost(rawForm: PostFormData): Promise<string> {
  const form = sanitizeForm(rawForm)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      cover_type: form.cover_type,
      status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505' && error.message.includes('slug')) {
      throw new Error('Ya existe un post con ese slug. Cambia el título o edita el slug manualmente.')
    }
    throw error
  }

  if (form.categoryIds.length) {
    const { error: catErr } = await supabase.from('post_categories').insert(
      form.categoryIds.map(cid => ({ post_id: post.id, category_id: cid }))
    )
    if (catErr) throw catErr
  }

  const tagIds = await upsertTags(form.tagNames)
  if (tagIds.length) {
    const { error: tagErr } = await supabase.from('post_tags').insert(
      tagIds.map(tid => ({ post_id: post.id, tag_id: tid }))
    )
    if (tagErr) throw tagErr
  }

  return post.id
}

async function updatePost(postId: string, rawForm: PostFormData): Promise<void> {
  const form = sanitizeForm(rawForm)
  const { error } = await supabase
    .from('posts')
    .update({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      cover_type: form.cover_type,
      status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', postId)

  if (error) {
    if (error.code === '23505' && error.message.includes('slug')) {
      throw new Error('Ya existe un post con ese slug. Cámbialo manualmente.')
    }
    throw error
  }

  await supabase.from('post_categories').delete().eq('post_id', postId)
  if (form.categoryIds.length) {
    const { error: catErr } = await supabase.from('post_categories').insert(
      form.categoryIds.map(cid => ({ post_id: postId, category_id: cid }))
    )
    if (catErr) throw catErr
  }

  await supabase.from('post_tags').delete().eq('post_id', postId)
  const tagIds = await upsertTags(form.tagNames)
  if (tagIds.length) {
    const { error: tagErr } = await supabase.from('post_tags').insert(
      tagIds.map(tid => ({ post_id: postId, tag_id: tid }))
    )
    if (tagErr) throw tagErr
  }
}

async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: PostFormData }) => updatePost(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: ['posts-feed'] })
      qc.invalidateQueries({ queryKey: ['post'] })
      qc.invalidateQueries({ queryKey: ['my-posts'] })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}
