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

  const movies = isSearching
    ? (Array.isArray(searchRes?.results) ? searchRes.results : []).filter((m) => m.media_type !== 'person')
    : (Array.isArray(catRes?.results) ? catRes.results : [])

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