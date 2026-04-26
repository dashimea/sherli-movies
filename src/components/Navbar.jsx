import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp'
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