'use client'

import { useCallback, useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

function getSnapshot(): boolean {
  return navigator.onLine
}

/** The server has no connection state; assume online so markup matches. */
function getServerSnapshot(): boolean {
  return true
}

/**
 * Whether the browser currently has a connection.
 *
 * Read through useSyncExternalStore rather than an effect, so the value is
 * correct on the first client render instead of flipping just after mount.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Same signal, but as a callback-friendly getter for code that only needs the
 * value at the moment something happens rather than on every change.
 */
export function useIsOnlineNow(): () => boolean {
  return useCallback(() => (typeof navigator === 'undefined' ? true : navigator.onLine), [])
}
