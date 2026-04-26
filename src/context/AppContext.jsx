import { useState, useEffect, useCallback, useMemo } from 'react'
import { AppContext } from './AppContextValue'

function parseLocalStorageJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function normalizeUser(value) {
  if (!value || typeof value !== 'object') return null

  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!name) return null

  return {
    name,
    description: typeof value.description === 'string' ? value.description : '',
    avatar: typeof value.avatar === 'string' ? value.avatar : '',
  }
}

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const savedFavs = parseLocalStorageJSON('favorites', [])
    return Array.isArray(savedFavs) ? savedFavs : []
  })

  const [watched, setWatched] = useState(() => {
    const savedWatched = parseLocalStorageJSON('watched', [])
    return Array.isArray(savedWatched) ? savedWatched : []
  })

  const [user, setUser] = useState(() => {
    const savedUser = parseLocalStorageJSON('user', null)
    return normalizeUser(savedUser)
  })

  // Для текущего проекта данные уже готовы после lazy-init из localStorage.
  const isReady = true

  // Сохраняем избранное при изменении
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Сохраняем историю просмотров
  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched))
  }, [watched])

  // Сохраняем пользователя
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  const addToFavorites = useCallback((movie) => {
    setFavorites((prev) => {
      const alreadyIn = prev.some((m) => m.id === movie.id)
      return alreadyIn ? prev.filter((m) => m.id !== movie.id) : [...prev, movie]
    })
  }, [])

  const addToWatched = useCallback((movie) => {
    setWatched((prev) => {
      const alreadyIn = prev.some((m) => m.id === movie.id)
      return alreadyIn ? prev : [movie, ...prev]
    })
  }, [])

  const isFavorite = useCallback((id) => {
    return favorites.some((m) => m.id === id)
  }, [favorites])

  const value = useMemo(() => {
    return { favorites, watched, user, setUser, addToFavorites, addToWatched, isFavorite, isReady }
  }, [favorites, watched, user, addToFavorites, addToWatched, isFavorite, isReady])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}