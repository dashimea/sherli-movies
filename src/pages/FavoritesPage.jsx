import Navbar from '../components/Navbar'
import MovieGrid from '../components/MovieGrid'
import { useApp } from '../context/useApp'
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