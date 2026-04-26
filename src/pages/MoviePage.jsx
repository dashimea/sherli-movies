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