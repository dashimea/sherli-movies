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