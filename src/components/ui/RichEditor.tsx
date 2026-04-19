import { useReducer, useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import { useAuth } from '../../features/auth/AuthContext'
import { uploadCoverImage } from '../../lib/storage'

// Custom FontSize via TextStyle global attribute
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, string | null>) =>
            attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
})

const TEXT_COLORS = ['#1a1a1a', '#e63946', '#f4b942', '#00bcd4', '#4caf50', '#9c27b0', '#ff6b2b', '#888888']
const HIGHLIGHT_COLORS = ['#fff176', '#ffb3c6', '#b3e5fc', '#c8e6c9', '#ffe0b2', '#e1bee7']
const FONT_FAMILIES = [
  { label: 'Default',  value: '' },
  { label: 'Mono',     value: 'var(--font-mono)' },
  { label: 'Display',  value: 'var(--font-display)' },
  { label: 'Serif',    value: 'Georgia, serif' },
]
const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

type Panel = 'color' | 'highlight' | 'font-family' | 'font-size' | 'link' | 'image' | null

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [panel, setPanel] = useState<Panel>(null)
  const [linkInput, setLinkInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escribe aquí… Usa el toolbar para dar formato.' }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript,
      Superscript,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate({ editor }) { onChange(editor.getHTML()); forceUpdate() },
    onSelectionUpdate: () => forceUpdate(),
    onTransaction: () => forceUpdate(),
    editorProps: { attributes: { class: 'rich-editor-body' } },
  })

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const words = (editor.storage.characterCount as { words?: () => number })?.words?.() ??
    editor.getText().trim().split(/\s+/).filter(Boolean).length

  const togglePanel = (p: Panel) => setPanel(prev => prev === p ? null : p)

  const insertImageByUrl = (url: string) => {
    if (!url.trim()) return
    editor?.chain().focus().setImage({ src: url.trim() }).run()
    setImageUrl('')
    setPanel(null)
  }

  const handleImageFile = async (file: File) => {
    if (!user) return
    setImageUploading(true)
    try {
      const url = await uploadCoverImage(file, user.id)
      editor?.chain().focus().setImage({ src: url }).run()
      setPanel(null)
    } catch {
      // silently ignore upload errors — user can retry
    } finally {
      setImageUploading(false)
    }
  }

  const applyLink = () => {
    if (!linkInput.trim()) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: linkInput.trim() }).run()
    setPanel(null)
    setLinkInput('')
  }

  // Helper: toolbar button
  const Btn = ({
    label, action, active = false,
    bold, italic, title,
  }: {
    label: string; action: () => void; active?: boolean
    bold?: boolean; italic?: boolean; title?: string
  }) => (
    <button
      type="button"
      title={title ?? label}
      onMouseDown={e => { e.preventDefault(); action() }}
      style={{
        fontWeight: bold ? 800 : 500,
        fontStyle: italic ? 'italic' : 'normal',
        fontFamily: italic ? 'Georgia, serif' : 'inherit',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--ink)',
        borderRadius: 0,
      }}
    >
      {label}
    </button>
  )

  const currentColor = editor.getAttributes('textStyle').color as string | undefined

  return (
    <div className="rich-editor" ref={wrapRef}>
      {/* ── Row 1: marks ── */}
      <div className="editor-toolbar editor-toolbar-row">
        <Btn label="B" action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} bold />
        <Btn label="I" action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} italic />
        <Btn label="U" action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} bold />
        <Btn label="S̶" action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
        <div className="tb-sep" />
        <Btn label="x₂" action={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subíndice" />
        <Btn label="x²" action={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superíndice" />
        <div className="tb-sep" />

        {/* Text color */}
        <button
          type="button"
          title="Color de texto"
          onMouseDown={e => { e.preventDefault(); togglePanel('color') }}
          className="tb-dropdown"
          style={{ background: panel === 'color' ? 'var(--ink)' : 'transparent', color: panel === 'color' ? 'var(--bg)' : 'var(--ink)' }}
        >
          <span>A</span>
          <span style={{ display: 'block', height: 3, background: currentColor ?? 'var(--ink)', marginTop: 1 }} />
        </button>

        {/* Highlight */}
        <button
          type="button"
          title="Resaltar"
          onMouseDown={e => { e.preventDefault(); togglePanel('highlight') }}
          className="tb-dropdown"
          style={{ background: panel === 'highlight' || editor.isActive('highlight') ? 'var(--ink)' : 'transparent', color: panel === 'highlight' || editor.isActive('highlight') ? 'var(--bg)' : 'var(--ink)' }}
        >
          ✦
        </button>

        <div className="tb-sep" />

        {/* Font family */}
        <button
          type="button"
          title="Fuente tipográfica"
          onMouseDown={e => { e.preventDefault(); togglePanel('font-family') }}
          className="tb-dropdown"
          style={{ fontSize: 11, background: panel === 'font-family' ? 'var(--ink)' : 'transparent', color: panel === 'font-family' ? 'var(--bg)' : 'var(--ink)' }}
        >
          Aa ▾
        </button>

        {/* Font size */}
        <button
          type="button"
          title="Tamaño de texto"
          onMouseDown={e => { e.preventDefault(); togglePanel('font-size') }}
          className="tb-dropdown"
          style={{ fontSize: 11, background: panel === 'font-size' ? 'var(--ink)' : 'transparent', color: panel === 'font-size' ? 'var(--bg)' : 'var(--ink)' }}
        >
          T↕ ▾
        </button>

        <span style={{
          marginLeft: 'auto', fontSize: 10,
          color: words < 10 ? 'var(--accent-1)' : 'var(--ink-mute)',
          letterSpacing: '0.2em', alignSelf: 'center',
        }}>
          {words} / 10 mín.
        </span>
      </div>

      {/* ── Row 2: blocks + insert ── */}
      <div className="editor-toolbar editor-toolbar-row" style={{ borderTop: '1px solid var(--line)' }}>
        <Btn label="H2" action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} bold />
        <Btn label="H3" action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} bold />
        <div className="tb-sep" />
        <Btn label="←" action={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Izquierda" />
        <Btn label="↔" action={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar" />
        <Btn label="→" action={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Derecha" />
        <Btn label="≡" action={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar" />
        <div className="tb-sep" />
        <Btn label="❝" action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita" />
        <Btn label="• —" action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista" />
        <Btn label="1." action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada" />
        <Btn label="</>" action={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloque código" />
        <Btn label="—" action={() => editor.chain().focus().setHorizontalRule().run()} title="Separador" />
        <div className="tb-sep" />

        {/* Link */}
        <button
          type="button"
          title="Enlace"
          onMouseDown={e => {
            e.preventDefault()
            setLinkInput(editor.getAttributes('link').href as string ?? '')
            togglePanel('link')
          }}
          className="tb-dropdown"
          style={{ background: editor.isActive('link') || panel === 'link' ? 'var(--ink)' : 'transparent', color: editor.isActive('link') || panel === 'link' ? 'var(--bg)' : 'var(--ink)' }}
        >
          🔗
        </button>

        {/* Table */}
        <button
          type="button"
          title="Insertar tabla 3×3"
          onMouseDown={e => {
            e.preventDefault()
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }}
          className="tb-dropdown"
          style={{ background: editor.isActive('table') ? 'var(--ink)' : 'transparent', color: editor.isActive('table') ? 'var(--bg)' : 'var(--ink)' }}
        >
          ⊞
        </button>

        {/* Image */}
        <button
          type="button"
          title="Insertar imagen"
          onMouseDown={e => { e.preventDefault(); togglePanel('image') }}
          className="tb-dropdown"
          style={{ background: panel === 'image' ? 'var(--ink)' : 'transparent', color: panel === 'image' ? 'var(--bg)' : 'var(--ink)' }}
        >
          IMG
        </button>

        <div className="tb-sep" />
        <Btn label="↩" action={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)" />
        <Btn label="↪" action={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)" />
      </div>

      {/* ── Panels ── */}
      {panel === 'color' && (
        <div className="tb-panel">
          <div className="tb-panel-label">COLOR DE TEXTO</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {TEXT_COLORS.map(c => (
              <button key={c} type="button" title={c}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setPanel(null) }}
                style={{ width: 24, height: 24, background: c, border: '2px solid var(--ink)', cursor: 'pointer' }}
              />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setPanel(null) }}
              style={{ padding: '2px 6px', border: '2px solid var(--ink)', cursor: 'pointer', fontSize: 11, background: 'var(--bg-panel)' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {panel === 'highlight' && (
        <div className="tb-panel">
          <div className="tb-panel-label">RESALTADO</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {HIGHLIGHT_COLORS.map(c => (
              <button key={c} type="button" title={c}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); setPanel(null) }}
                style={{ width: 24, height: 24, background: c, border: '2px solid var(--ink)', cursor: 'pointer' }}
              />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setPanel(null) }}
              style={{ padding: '2px 6px', border: '2px solid var(--ink)', cursor: 'pointer', fontSize: 11, background: 'var(--bg-panel)' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {panel === 'font-family' && (
        <div className="tb-panel">
          <div className="tb-panel-label">FUENTE TIPOGRÁFICA</div>
          <div style={{ display: 'flex', gap: 0, flexDirection: 'column' }}>
            {FONT_FAMILIES.map((f, i) => (
              <button key={f.value} type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  if (f.value) editor.chain().focus().setFontFamily(f.value).run()
                  else editor.chain().focus().unsetFontFamily().run()
                  setPanel(null)
                }}
                style={{
                  textAlign: 'left', padding: '7px 10px',
                  fontFamily: f.value || 'inherit', fontSize: 13,
                  border: '2px solid var(--ink)', borderTop: i === 0 ? '2px solid var(--ink)' : 'none',
                  background: 'var(--bg-panel)', cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === 'font-size' && (
        <div className="tb-panel">
          <div className="tb-panel-label">TAMAÑO DE TEXTO</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {FONT_SIZES.map(s => (
              <button key={s} type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  editor.chain().focus().setMark('textStyle', { fontSize: s } as Record<string, unknown>).run()
                  setPanel(null)
                }}
                style={{ padding: '4px 8px', border: '2px solid var(--ink)', background: 'var(--bg-panel)', cursor: 'pointer', fontSize: 12 }}
              >
                {s}
              </button>
            ))}
            <button type="button"
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetMark('textStyle').run(); setPanel(null) }}
              style={{ padding: '4px 8px', border: '2px solid var(--ink)', background: 'var(--bg-panel)', cursor: 'pointer', fontSize: 11 }}>
              ✕ Reset
            </button>
          </div>
        </div>
      )}

      {panel === 'image' && (
        <div className="tb-panel">
          <div className="tb-panel-label">INSERTAR IMAGEN</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && insertImageByUrl(imageUrl)}
              placeholder="https://..."
              autoFocus
              style={{ flex: 1, fontSize: 13, padding: '5px 8px', fontFamily: 'var(--font-mono)' }}
            />
            <button type="button" onMouseDown={e => { e.preventDefault(); insertImageByUrl(imageUrl) }}
              style={{ padding: '5px 12px', border: '2px solid var(--ink)', background: 'var(--accent-2)', cursor: 'pointer', fontWeight: 700 }}>
              OK
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>o sube un archivo:</span>
            <button
              type="button"
              disabled={imageUploading}
              onMouseDown={e => { e.preventDefault(); imageFileRef.current?.click() }}
              style={{ padding: '4px 10px', border: '2px solid var(--ink)', background: 'var(--bg-panel)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
            >
              {imageUploading ? '▒ subiendo…' : '⬆ Archivo'}
            </button>
            <input
              ref={imageFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageFile(f); e.target.value = '' }}
            />
          </div>
        </div>
      )}

      {panel === 'link' && (
        <div className="tb-panel">
          <div className="tb-panel-label">ENLACE</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyLink()}
              placeholder="https://..."
              autoFocus
              style={{ flex: 1, fontSize: 13, padding: '5px 8px', fontFamily: 'var(--font-mono)' }}
            />
            <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }}
              style={{ padding: '5px 12px', border: '2px solid var(--ink)', background: 'var(--accent-2)', cursor: 'pointer', fontWeight: 700 }}>
              OK
            </button>
            {editor.isActive('link') && (
              <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetLink().run(); setPanel(null) }}
                style={{ padding: '5px 8px', border: '2px solid var(--ink)', background: 'var(--bg-panel)', cursor: 'pointer' }}>
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
