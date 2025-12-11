import { useState, useEffect, useRef } from "react"
import "./FieldOfWorkAutocomplete.css"

function FieldOfWorkAutocomplete({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  placeholder,
  fieldsOfWork = [] 
}) {
  const [query, setQuery] = useState(value || "")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    setQuery(value || "")
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filterFields = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      setSuggestions([])
      return
    }

    // Filter fields that match the search term
    const searchLower = searchTerm.toLowerCase()
    const filtered = fieldsOfWork
      .filter((field) => field.toLowerCase().includes(searchLower))
      .slice(0, 10) // Limit to 10 suggestions

    setSuggestions(filtered)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange({ target: { name: "fieldOfWork", value: newValue } })
    setSelectedIndex(-1)

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (newValue.length >= 1) {
      // Debounce filtering
      debounceTimer.current = setTimeout(() => {
        filterFields(newValue)
        setShowSuggestions(true)
      }, 200)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleSelectField = (field) => {
    setQuery(field)
    onChange({ target: { name: "fieldOfWork", value: field } })
    setShowSuggestions(false)
    setSuggestions([])
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectField(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  return (
    <div className="field-autocomplete-wrapper" ref={wrapperRef}>
      <div className="field-autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          name="fieldOfWork"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 1 && suggestions.length > 0) {
              setShowSuggestions(true)
            } else if (query.length >= 1) {
              filterFields(query)
              setShowSuggestions(true)
            }
          }}
          onBlur={(e) => {
            // Delay to allow click on suggestion
            setTimeout(() => {
              setShowSuggestions(false)
              if (onBlur) onBlur(e)
            }, 200)
          }}
          placeholder={placeholder || "הקלד תחום עיסוק..."}
          className={`field-input ${error ? "error" : ""}`}
          autoComplete="off"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="field-suggestions">
          {suggestions.map((field, index) => (
            <li
              key={field}
              className={`suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => handleSelectField(field)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="field-name">{field}</span>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions &&
        query.length >= 1 &&
        suggestions.length === 0 &&
        fieldsOfWork.length > 0 && (
          <div className="no-suggestions">לא נמצאו תוצאות</div>
        )}
    </div>
  )
}

export default FieldOfWorkAutocomplete

