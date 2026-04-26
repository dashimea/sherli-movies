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