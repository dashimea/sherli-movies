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