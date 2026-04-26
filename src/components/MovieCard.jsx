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