import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [watched, setWatched] = useState([])
  const [user, setUser] = useState(null)
  // isReady нужен чтобы не было моргания на /welcome при обновлении страницы
  const [isReady, setIsReady] = useState(false)

  // Загружаем данные из localStorage при старте
  useEffect(() => {
    const savedFavs = localStorage.getItem('favorites')
    const savedWatched = localStorage.getItem('watched')
    const savedUser = localStorage.getItem('user')

    if (savedFavs) setFavorites(JSON.parse(savedFavs))
    if (savedWatched) setWatched(JSON.parse(savedWatched))
    if (savedUser) setUser(JSON.parse(savedUser))

    setIsReady(true)
  }, [])

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

  function addToFavorites(movie) {
    const alreadyIn = favorites.find((m) => m.id === movie.id)
    if (alreadyIn) {
      setFavorites(favorites.filter((m) => m.id !== movie.id))
    } else {
      setFavorites([...favorites, movie])
    }
  }

  function addToWatched(movie) {
    const alreadyIn = watched.find((m) => m.id === movie.id)
    if (!alreadyIn) {
      setWatched([movie, ...watched])
    }
  }

  function isFavorite(id) {
    return favorites.some((m) => m.id === id)
  }

  return (
    <AppContext.Provider value={{ favorites, watched, user, setUser, addToFavorites, addToWatched, isFavorite, isReady }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}