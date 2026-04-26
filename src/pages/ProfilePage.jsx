import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MovieGrid from '../components/MovieGrid'
import { useApp } from '../context/useApp'
import './ProfilePage.css'

function ProfilePage() {
  const { user, setUser, watched } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const [fileError, setFileError] = useState('')

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
    setAvatarInput(user.avatar || '')
    setFileError('')
    setEditing(true)
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Нужен файл изображения')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarInput(reader.result)
        setFileError('')
      }
    }
    reader.readAsDataURL(file)
  }

  function saveEdit() {
    if (!nameInput.trim()) return
    setUser({ ...user, name: nameInput.trim(), description: descInput, avatar: avatarInput })
    setEditing(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container profile">

        <div className="profile__card">
          <div className="profile__avatar">
            {user.avatar ? (
              <img className="profile__avatar-img" src={user.avatar} alt={user.name} />
            ) : (
              user.name[0].toUpperCase()
            )}
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
                <label className="profile__file-label">
                  Фото профиля
                  <input
                    className="profile__file"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                {fileError && <p className="profile__file-error">{fileError}</p>}
                {avatarInput && (
                  <img className="profile__preview" src={avatarInput} alt="Предпросмотр" />
                )}
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