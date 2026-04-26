import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/useApp'
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