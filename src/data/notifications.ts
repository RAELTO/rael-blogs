export type NotifKind = 'react' | 'comment' | 'follow' | 'mention' | 'like' | 'system'

export interface MockNotif {
  id: string
  kind: NotifKind
  actor?: { initial: string; color: string; name: string }
  text: string
  time: string
  unread: boolean
}

export const MOCK_NOTIFS: MockNotif[] = [
  {
    id: 'n1', kind: 'react', unread: true, time: 'ahora',
    actor: { initial: 'L', color: 'var(--accent-5)', name: 'Lucía Méndez' },
    text: 'reaccionó SHARP a tu Box',
  },
  {
    id: 'n2', kind: 'comment', unread: true, time: '5 min',
    actor: { initial: 'S', color: 'var(--accent-3)', name: 'Sam Ortiz' },
    text: 'comentó: "Mucho boomer offset por aquí. Aprobado."',
  },
  {
    id: 'n3', kind: 'follow', unread: true, time: '12 min',
    actor: { initial: 'A', color: 'var(--accent-1)', name: 'Ana Bermúdez' },
    text: 'te empezó a seguir',
  },
  {
    id: 'n4', kind: 'mention', unread: false, time: '32 min',
    actor: { initial: 'M', color: 'var(--accent-5)', name: 'Mara López' },
    text: 'te mencionó en su Box',
  },
  {
    id: 'n5', kind: 'like', unread: false, time: '1 h',
    actor: { initial: 'K', color: 'var(--accent-4)', name: 'Kenji Watanabe' },
    text: 'le dio like a tu Box',
  },
  {
    id: 'n6', kind: 'system', unread: false, time: '2 h',
    text: 'Tu Box llegó a TOP 10 LOUD esta semana 🏆',
  },
  {
    id: 'n7', kind: 'follow', unread: false, time: 'ayer',
    actor: { initial: 'T', color: 'var(--accent-3)', name: 'Tomás Vera' },
    text: 'te empezó a seguir',
  },
  {
    id: 'n8', kind: 'comment', unread: false, time: 'ayer',
    actor: { initial: 'P', color: 'var(--accent-2)', name: 'Paulina Ríos' },
    text: 'respondió a tu comentario',
  },
]

export const UNREAD_COUNT = MOCK_NOTIFS.filter(n => n.unread).length
