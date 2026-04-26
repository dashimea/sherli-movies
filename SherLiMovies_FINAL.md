# SherLiMovies — финальный код

## Установка и запуск

```bash
npm create vite@latest sherli-movies -- --template react
cd sherli-movies
npm install react-router-dom
npm run dev
```

Создай файл `.env` в корне проекта:
```
VITE_TMDB_TOKEN=Bearer твой_токен_здесь
```
Токен берёшь на themoviedb.org → Settings → API → Read Access Token (v4)

Добавь в `.gitignore` строку `.env` — чтобы токен не улетел на GitHub.

---

## Структура папок

```
src/
  components/
    MovieCard.jsx
    MovieCard.css
    MovieGrid.jsx
    MovieGrid.css
    Navbar.jsx
    Navbar.css
    SearchBar.jsx
    SearchBar.css
    Loader.jsx
    Loader.css
  pages/
    WelcomePage.jsx
    WelcomePage.css
    HomePage.jsx
    HomePage.css
    MoviePage.jsx
    MoviePage.css
    FavoritesPage.jsx
    FavoritesPage.css
    ProfilePage.jsx
    ProfilePage.css
  hooks/
    useFetch.js
    useDebounce.js
  context/
    AppContext.jsx
  App.jsx
  App.css
  main.jsx
  index.css
```

---

## src/index.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --dark: #0f0f13;
  --dark2: #1a1a22;
  --dark3: #22222e;
  --red: #e63946;
  --light: #f0f0f0;
  --gray: #888;
  --border: #2e2e3e;
}

body {
  background: var(--dark);
  color: var(--light);
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
```

---

## src/hooks/useFetch.js

```js
import { useState, useEffect } from 'react'

function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return

    setLoading(true)
    setError(null)
    setData(null)

    fetch(url, {
      headers: {
        Authorization: import.meta.env.VITE_TMDB_TOKEN,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [url])

  return { data, loading, error }
}

export default useFetch
```

---

## src/hooks/useDebounce.js

```js
import { useState, useEffect } from 'react'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
```

---

## src/context/AppContext.jsx

```jsx
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
```

---

## src/components/Loader.jsx

```jsx
import './Loader.css'

function Loader() {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner"></div>
    </div>
  )
}

export default Loader
```

## src/components/Loader.css

```css
.loader-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## src/components/MovieCard.jsx

```jsx
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './MovieCard.css'

const IMG_BASE = 'https://image.tmdb.org/t/p/w342'

function MovieCard({ movie }) {
  const { addToFavorites, isFavorite } = useApp()
  const fav = isFavorite(movie.id)

  const poster = movie.poster_path
    ? IMG_BASE + movie.poster_path
    : 'https://placehold.co/342x513?text=Нет+постера'

  const title = movie.title || movie.name
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4)
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  // Определяем тип — фильм или сериал/аниме
  // TMDB возвращает media_type в поиске, но не в списках категорий
  // Если есть name и нет title — это TV (сериал/аниме)
  const mediaType = movie.media_type || (movie.name && !movie.title ? 'tv' : 'movie')
  const linkPath = `/${mediaType}/${movie.id}`

  function handleFavClick(e) {
    e.preventDefault()
    addToFavorites(movie)
  }

  return (
    <Link to={linkPath} className="movie-card">
      <div className="movie-card__img-wrap">
        <img src={poster} alt={title} className="movie-card__img" />
        <button
          className={`movie-card__fav ${fav ? 'movie-card__fav--active' : ''}`}
          onClick={handleFavClick}
        >
          {fav ? '♥' : '♡'}
        </button>
        {rating && (
          <span className="movie-card__rating">{rating}</span>
        )}
      </div>
      <div className="movie-card__info">
        <p className="movie-card__title">{title}</p>
        <p className="movie-card__year">{year}</p>
      </div>
    </Link>
  )
}

export default MovieCard
```

## src/components/MovieCard.css

```css
.movie-card {
  display: block;
  background: #1e1e28;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: transform 0.2s;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card__img-wrap {
  position: relative;
}

.movie-card__img {
  width: 100%;
  display: block;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.movie-card__fav {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 16px;
  color: var(--gray);
}

.movie-card__fav--active {
  color: var(--red);
}

.movie-card__rating {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
}

.movie-card__info {
  padding: 10px 12px 12px;
}

.movie-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--light);
  line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-card__year {
  font-size: 12px;
  color: var(--gray);
}
```

---

## src/components/MovieGrid.jsx

```jsx
import MovieCard from './MovieCard'
import './MovieGrid.css'

function MovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return <p className="grid-empty">Ничего не найдено</p>
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid
```

## src/components/MovieGrid.css

```css
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 16px;
}

.grid-empty {
  text-align: center;
  color: var(--gray);
  padding: 50px 0;
}
```

---

## src/components/SearchBar.jsx

```jsx
import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')

  function handleChange(e) {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  function clearSearch() {
    setValue('')
    onSearch('')
  }

  return (
    <div className="search">
      <input
        className="search__input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Поиск фильмов..."
      />
      {value && (
        <button className="search__clear" onClick={clearSearch}>✕</button>
      )}
    </div>
  )
}

export default SearchBar
```

## src/components/SearchBar.css

```css
.search {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search__input {
  width: 100%;
  background: var(--dark2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 11px 40px 11px 16px;
  font-size: 15px;
  color: var(--light);
  outline: none;
}

.search__input:focus {
  border-color: var(--red);
}

.search__clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 14px;
}
```

---

## src/components/Navbar.jsx

```jsx
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Navbar.css'

function Navbar() {
  const { user, favorites } = useApp()

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          SherLi<span>Movies</span>
        </Link>
        <div className="navbar__links">
          <Link to="/" className="navbar__link">Главная</Link>
          <Link to="/favorites" className="navbar__link">
            Избранное
            {favorites.length > 0 && (
              <span className="navbar__badge">{favorites.length}</span>
            )}
          </Link>
          <Link to="/profile" className="navbar__link">
            {user ? user.name : 'Профиль'}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
```

## src/components/Navbar.css

```css
.navbar {
  background: #0f0f13;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}

.navbar__logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--red);
}

.navbar__logo span {
  color: var(--light);
}

.navbar__links {
  display: flex;
  gap: 6px;
  align-items: center;
}

.navbar__link {
  padding: 6px 13px;
  border-radius: 7px;
  font-size: 14px;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 5px;
}

.navbar__link:hover {
  background: var(--dark2);
  color: var(--light);
}

.navbar__badge {
  background: var(--red);
  color: white;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
}
```

---

## src/pages/WelcomePage.jsx

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './WelcomePage.css'

function WelcomePage() {
  const { setUser } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleEnter() {
    if (!name.trim()) {
      setError('Введи имя чтобы продолжить')
      return
    }
    setUser({ name: name.trim(), description: '' })
    navigate('/')
  }

  return (
    <div className="welcome">
      <div className="welcome__box">
        <div className="welcome__icon">🎬</div>
        <h1 className="welcome__title">SherLiMovies</h1>
        <p className="welcome__sub">Каталог фильмов и аниме для твоих вечеров</p>

        <input
          className={`welcome__input ${error ? 'welcome__input--error' : ''}`}
          type="text"
          placeholder="Твоё имя"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
        />
        {error && <p className="welcome__error">{error}</p>}

        <button className="welcome__btn" onClick={handleEnter}>
          Войти
        </button>

        <p className="welcome__note">Всё хранится в твоём браузере</p>
      </div>
    </div>
  )
}

export default WelcomePage
```

## src/pages/WelcomePage.css

```css
.welcome {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--dark);
}

.welcome__box {
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.welcome__icon {
  font-size: 52px;
  margin-bottom: 14px;
}

.welcome__title {
  font-size: 34px;
  font-weight: 800;
  color: var(--red);
  margin-bottom: 8px;
}

.welcome__sub {
  color: var(--gray);
  font-size: 15px;
  margin-bottom: 36px;
}

.welcome__input {
  width: 100%;
  background: var(--dark2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--light);
  outline: none;
  margin-bottom: 8px;
}

.welcome__input:focus {
  border-color: var(--red);
}

.welcome__input--error {
  border-color: var(--red);
}

.welcome__error {
  color: var(--red);
  font-size: 13px;
  margin-bottom: 10px;
  text-align: left;
}

.welcome__btn {
  width: 100%;
  background: var(--red);
  color: white;
  border-radius: 8px;
  padding: 13px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
}

.welcome__btn:hover {
  background: #c0303d;
}

.welcome__note {
  color: #444;
  font-size: 13px;
  margin-top: 18px;
}
```

---

## src/pages/HomePage.jsx

```jsx
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useDebounce from '../hooks/useDebounce'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import MovieGrid from '../components/MovieGrid'
import Loader from '../components/Loader'
import './HomePage.css'

const API_BASE = 'https://api.themoviedb.org/3'

const categories = [
  { name: 'Популярные', url: `${API_BASE}/movie/popular?language=ru-RU` },
  { name: 'Топ рейтинга', url: `${API_BASE}/movie/top_rated?language=ru-RU` },
  { name: 'В кино сейчас', url: `${API_BASE}/movie/now_playing?language=ru-RU` },
  { name: 'Аниме', url: `${API_BASE}/discover/tv?with_genres=16&sort_by=popularity.desc&language=ru-RU` },
]

function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState(0)

  const debouncedQuery = useDebounce(query, 500)

  const searchUrl = debouncedQuery
    ? `${API_BASE}/search/multi?query=${encodeURIComponent(debouncedQuery)}&language=ru-RU`
    : null

  const catUrl = !debouncedQuery ? categories[activeCat].url : null

  const { data: searchRes, loading: searchLoading, error: searchErr } = useFetch(searchUrl)
  const { data: catRes, loading: catLoading, error: catErr } = useFetch(catUrl)

  const isSearching = debouncedQuery.length > 0

  let movies = []
  if (isSearching) {
    movies = searchRes ? searchRes.results.filter((m) => m.media_type !== 'person') : []
  } else {
    movies = catRes ? catRes.results : []
  }

  const loading = isSearching ? searchLoading : catLoading
  const error = isSearching ? searchErr : catErr

  return (
    <div>
      <Navbar />
      <div className="container home">
        <div className="home__search">
          <SearchBar onSearch={setQuery} />
        </div>

        {!isSearching && (
          <div className="home__cats">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`home__cat-btn ${activeCat === i ? 'home__cat-btn--active' : ''}`}
                onClick={() => setActiveCat(i)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <h2 className="home__heading">
          {isSearching ? `Поиск: ${debouncedQuery}` : categories[activeCat].name}
        </h2>

        {loading && <Loader />}
        {error && <p className="home__error">Ошибка загрузки: {error}</p>}
        {!loading && !error && <MovieGrid movies={movies} />}
      </div>
    </div>
  )
}

export default HomePage
```

## src/pages/HomePage.css

```css
.home {
  padding-top: 28px;
  padding-bottom: 50px;
}

.home__search {
  margin-bottom: 24px;
}

.home__cats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.home__cat-btn {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--dark2);
  color: var(--gray);
  border: 1px solid var(--border);
}

.home__cat-btn:hover {
  color: var(--light);
}

.home__cat-btn--active {
  background: var(--red);
  color: white;
  border-color: var(--red);
}

.home__heading {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.home__error {
  color: var(--red);
  text-align: center;
  padding: 40px 0;
}
```

---

## src/pages/MoviePage.jsx

```jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useFetch from '../hooks/useFetch'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import './MoviePage.css'

const API_BASE = 'https://api.themoviedb.org/3'

// Страница работает и для фильмов (/movie/:id) и для сериалов/аниме (/tv/:id)
function MoviePage({ mediaType = 'movie' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToFavorites, isFavorite, addToWatched } = useApp()

  const { data: item, loading, error } = useFetch(`${API_BASE}/${mediaType}/${id}?language=ru-RU`)

  const fav = isFavorite(Number(id))

  useEffect(() => {
    if (item) {
      addToWatched(item)
    }
  }, [item])

  if (loading) {
    return (
      <div>
        <Navbar />
        <Loader />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div>
        <Navbar />
        <div className="movie-page__error">
          <p>Не удалось загрузить</p>
          <button onClick={() => navigate(-1)}>← Назад</button>
        </div>
      </div>
    )
  }

  const title = item.title || item.name
  const releaseDate = item.release_date || item.first_air_date

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null

  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : null

  return (
    <div>
      <Navbar />

      {backdrop && (
        <div
          className="movie-page__backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
        >
          <div className="movie-page__backdrop-fade" />
        </div>
      )}

      <div className={`container movie-page ${backdrop ? 'movie-page--with-backdrop' : ''}`}>
        <button className="movie-page__back" onClick={() => navigate(-1)}>
          ← Назад
        </button>

        <div className="movie-page__content">
          {poster && (
            <img src={poster} alt={title} className="movie-page__poster" />
          )}

          <div className="movie-page__info">
            <h1 className="movie-page__title">{title}</h1>

            {item.tagline && (
              <p className="movie-page__tagline">{item.tagline}</p>
            )}

            <div className="movie-page__meta">
              {item.vote_average > 0 && (
                <span className="movie-page__tag movie-page__tag--green">
                  ★ {item.vote_average.toFixed(1)}
                </span>
              )}
              {releaseDate && (
                <span className="movie-page__tag">{releaseDate.slice(0, 4)}</span>
              )}
              {item.runtime > 0 && (
                <span className="movie-page__tag">{item.runtime} мин</span>
              )}
              {mediaType === 'tv' && (
                <span className="movie-page__tag">Сериал</span>
              )}
            </div>

            {item.genres && item.genres.length > 0 && (
              <div className="movie-page__genres">
                {item.genres.map((g) => (
                  <span key={g.id} className="movie-page__genre">{g.name}</span>
                ))}
              </div>
            )}

            {item.overview && (
              <p className="movie-page__overview">{item.overview}</p>
            )}

            <button
              className={`movie-page__fav-btn ${fav ? 'movie-page__fav-btn--active' : ''}`}
              onClick={() => addToFavorites(item)}
            >
              {fav ? '♥ В избранном' : '♡ Добавить в избранное'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoviePage
```

## src/pages/MoviePage.css

```css
.movie-page__backdrop {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.movie-page__backdrop-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 20%, var(--dark) 100%);
}

.movie-page {
  padding-bottom: 60px;
  padding-top: 32px;
}

.movie-page--with-backdrop {
  margin-top: -100px;
  position: relative;
}

.movie-page__back {
  color: var(--gray);
  font-size: 14px;
  margin-bottom: 24px;
  display: block;
}

.movie-page__back:hover {
  color: var(--light);
}

.movie-page__content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.movie-page__poster {
  width: 200px;
  border-radius: 10px;
  flex-shrink: 0;
}

.movie-page__info {
  flex: 1;
  min-width: 240px;
}

.movie-page__title {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.2;
}

.movie-page__tagline {
  color: var(--gray);
  font-style: italic;
  margin-bottom: 16px;
  font-size: 15px;
}

.movie-page__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.movie-page__tag {
  background: var(--dark2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  color: var(--gray);
}

.movie-page__tag--green {
  color: #4caf50;
}

.movie-page__genres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.movie-page__genre {
  background: var(--dark3);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  color: #aaa;
}

.movie-page__overview {
  color: #ccc;
  line-height: 1.7;
  margin-bottom: 24px;
  max-width: 580px;
  font-size: 15px;
}

.movie-page__fav-btn {
  padding: 11px 26px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--red);
  color: var(--red);
  background: transparent;
}

.movie-page__fav-btn:hover {
  background: var(--red);
  color: white;
}

.movie-page__fav-btn--active {
  background: var(--red);
  color: white;
}

.movie-page__error {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray);
}

.movie-page__error button {
  color: var(--red);
  margin-top: 12px;
  font-size: 14px;
}
```

---

## src/pages/FavoritesPage.jsx

```jsx
import Navbar from '../components/Navbar'
import MovieGrid from '../components/MovieGrid'
import { useApp } from '../context/AppContext'
import './FavoritesPage.css'

function FavoritesPage() {
  const { favorites } = useApp()

  return (
    <div>
      <Navbar />
      <div className="container favs">
        <h1 className="favs__title">
          Избранное
          {favorites.length > 0 && (
            <span className="favs__count">{favorites.length}</span>
          )}
        </h1>

        {favorites.length === 0 ? (
          <div className="favs__empty">
            <p className="favs__empty-icon">♡</p>
            <p>Список пуст</p>
            <p className="favs__empty-hint">Жми сердечко на карточке чтобы добавить</p>
          </div>
        ) : (
          <MovieGrid movies={favorites} />
        )}
      </div>
    </div>
  )
}

export default FavoritesPage
```

## src/pages/FavoritesPage.css

```css
.favs {
  padding-top: 30px;
  padding-bottom: 50px;
}

.favs__title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.favs__count {
  font-size: 16px;
  font-weight: 400;
  color: var(--gray);
}

.favs__empty {
  text-align: center;
  padding: 60px 0;
  color: var(--gray);
}

.favs__empty-icon {
  font-size: 48px;
  margin-bottom: 14px;
}

.favs__empty-hint {
  font-size: 13px;
  margin-top: 8px;
  color: #555;
}
```

---

## src/pages/ProfilePage.jsx

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MovieGrid from '../components/MovieGrid'
import { useApp } from '../context/AppContext'
import './ProfilePage.css'

function ProfilePage() {
  const { user, setUser, watched } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="profile-empty">
          <p>Сначала войди</p>
          <button onClick={() => navigate('/welcome')}>На страницу входа</button>
        </div>
      </div>
    )
  }

  function startEdit() {
    setNameInput(user.name)
    setDescInput(user.description)
    setEditing(true)
  }

  function saveEdit() {
    if (!nameInput.trim()) return
    setUser({ ...user, name: nameInput.trim(), description: descInput })
    setEditing(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container profile">

        <div className="profile__card">
          <div className="profile__avatar">
            {user.name[0].toUpperCase()}
          </div>

          <div className="profile__details">
            {editing ? (
              <div className="profile__form">
                <input
                  className="profile__input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Имя"
                />
                <textarea
                  className="profile__textarea"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Пару слов о себе..."
                  rows={3}
                />
                <div className="profile__form-btns">
                  <button className="profile__save-btn" onClick={saveEdit}>Сохранить</button>
                  <button className="profile__cancel-btn" onClick={() => setEditing(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="profile__name">{user.name}</h2>
                <p className="profile__desc">{user.description || 'Нет описания'}</p>
                <p className="profile__watched-count">Просмотрено фильмов: {watched.length}</p>
                <button className="profile__edit-btn" onClick={startEdit}>Редактировать</button>
              </div>
            )}
          </div>
        </div>

        <h2 className="profile__section-title">История просмотров</h2>
        {watched.length === 0 ? (
          <p className="profile__no-history">Ты ещё не открывал ни одного фильма</p>
        ) : (
          <MovieGrid movies={watched.slice(0, 12)} />
        )}
      </div>
    </div>
  )
}

export default ProfilePage
```

## src/pages/ProfilePage.css

```css
.profile {
  padding-top: 36px;
  padding-bottom: 60px;
}

.profile__card {
  background: var(--dark2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.profile__avatar {
  width: 72px;
  height: 72px;
  background: var(--red);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.profile__details {
  flex: 1;
  min-width: 200px;
}

.profile__name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.profile__desc {
  color: var(--gray);
  font-size: 14px;
  margin-bottom: 12px;
}

.profile__watched-count {
  font-size: 13px;
  color: #666;
  margin-bottom: 14px;
}

.profile__edit-btn {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 13px;
  color: #aaa;
}

.profile__edit-btn:hover {
  border-color: var(--gray);
  color: var(--light);
}

.profile__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile__input,
.profile__textarea {
  background: var(--dark);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--light);
  outline: none;
  width: 100%;
}

.profile__input:focus,
.profile__textarea:focus {
  border-color: var(--red);
}

.profile__textarea {
  resize: none;
}

.profile__form-btns {
  display: flex;
  gap: 10px;
}

.profile__save-btn {
  background: var(--red);
  color: white;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
}

.profile__cancel-btn {
  color: var(--gray);
  padding: 8px 16px;
  font-size: 14px;
}

.profile__section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.profile__no-history {
  color: #555;
  font-size: 14px;
}

.profile-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray);
}

.profile-empty button {
  margin-top: 16px;
  color: var(--red);
  font-size: 14px;
}
```

---

## src/App.jsx

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import WelcomePage from './pages/WelcomePage'
import HomePage from './pages/HomePage'
import MoviePage from './pages/MoviePage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'

// Простая защита роутов — если нет пользователя, редиректим
// isReady ждёт пока данные загрузятся из localStorage, иначе будет мигание
function PrivateRoute({ children }) {
  const { user, isReady } = useApp()

  if (!isReady) return null

  if (!user) {
    return <Navigate to="/welcome" />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/movie/:id" element={<PrivateRoute><MoviePage mediaType="movie" /></PrivateRoute>} />
          <Route path="/tv/:id" element={<PrivateRoute><MoviePage mediaType="tv" /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
```

---

## src/main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```
