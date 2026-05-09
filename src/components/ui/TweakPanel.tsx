import { useEffect } from 'react'
import { loadTweaks, saveTweaks } from './tweaks'

/** Applies saved tweaks on mount — no visible UI (button removed) */
export function TweakPanel() {
  useEffect(() => {
    const t = loadTweaks()
    saveTweaks(t)
  }, [])
  return null
}
