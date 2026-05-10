import { createContext, useContext, useState } from 'react'

export interface FloatingChatEntry {
  conversationId: string
  otherId: string
  otherName: string
  otherAvatar: string | null
  minimized: boolean
}

interface Ctx {
  chats: FloatingChatEntry[]
  openChat:       (entry: Omit<FloatingChatEntry, 'minimized'>) => void
  closeChat:      (conversationId: string) => void
  toggleMinimize: (conversationId: string) => void
}

const FloatingChatContext = createContext<Ctx>({
  chats: [], openChat: () => {}, closeChat: () => {}, toggleMinimize: () => {},
})

export function FloatingChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<FloatingChatEntry[]>([])

  const openChat = (entry: Omit<FloatingChatEntry, 'minimized'>) => {
    setChats(prev => {
      const exists = prev.find(c => c.conversationId === entry.conversationId)
      if (exists) {
        // Si estaba minimizado, desminimizar
        return prev.map(c => c.conversationId === entry.conversationId ? { ...c, minimized: false } : c)
      }
      return [...prev, { ...entry, minimized: false }]
    })
  }

  const closeChat = (conversationId: string) =>
    setChats(prev => prev.filter(c => c.conversationId !== conversationId))

  const toggleMinimize = (conversationId: string) =>
    setChats(prev => prev.map(c => c.conversationId === conversationId ? { ...c, minimized: !c.minimized } : c))

  return (
    <FloatingChatContext.Provider value={{ chats, openChat, closeChat, toggleMinimize }}>
      {children}
    </FloatingChatContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFloatingChat() {
  return useContext(FloatingChatContext)
}
