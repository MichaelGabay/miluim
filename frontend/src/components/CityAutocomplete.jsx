import { useState, useEffect, useRef } from "react"
import "./CityAutocomplete.css"

const API_URL = "https://data.gov.il/api/3/action/datastore_search"

// Cache for cities data
let citiesCache = null
let citiesCachePromise = null

function CityAutocomplete({ value, onChange, onBlur, error, placeholder }) {
  const [query, setQuery] = useState(value || "")
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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

  const loadCitiesData = async () => {
    // Return cached data if available
    if (citiesCache) {
      return citiesCache
    }

    // Return existing promise if already loading
    if (citiesCachePromise) {
      return citiesCachePromise
    }

    // Create new promise to fetch cities
    citiesCachePromise = fetch(
      `${API_URL}?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.result.records) {
          citiesCache = data.result.records
            .map((city) => ({
              id: city._id,
              name: city.שם_ישוב?.trim() || "",
              englishName: city.שם_ישוב_לועזי?.trim() || "",
              district: city.שם_נפה?.trim() || "",
              council: city.שם_מועצה?.trim() || "",
            }))
            .filter((city) => city.name) // Filter out empty names
          return citiesCache
        }
        return []
      })
      .catch((error) => {
        console.error("Error fetching cities:", error)
        citiesCachePromise = null
        return []
      })

    return citiesCachePromise
  }

  const fetchCities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const citiesData = await loadCitiesData()

      // Filter cities that match the search term in Hebrew name
      const searchLower = searchTerm.toLowerCase()
      const filtered = citiesData
        .filter((city) => city.name.toLowerCase().includes(searchLower))
        .slice(0, 10) // Limit to 10 suggestions

      setSuggestions(filtered)
    } catch (error) {
      console.error("Error filtering cities:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange({ target: { name: "city", value: newValue } })
    setSelectedIndex(-1)

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (newValue.length >= 2) {
      // Debounce API calls
      debounceTimer.current = setTimeout(() => {
        fetchCities(newValue)
        setShowSuggestions(true)
      }, 300)
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

  const handleSelectCity = (city) => {
    setQuery(city.name)
    onChange({ target: { name: "city", value: city.name } })
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
          handleSelectCity(suggestions[selectedIndex])
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
    <div className="city-autocomplete-wrapper" ref={wrapperRef}>
      <div className="city-autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          name="city"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
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
          placeholder={placeholder || "הקלד שם עיר..."}
          className={`city-input ${error ? "error" : ""}`}
          autoComplete="off"
        />
        {isLoading && <span className="loading-indicator">טוען...</span>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city.id}
              className={`suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => handleSelectCity(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="city-name">{city.name}</span>
              {city.district && (
                <span className="city-district">{city.district}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions &&
        !isLoading &&
        query.length >= 2 &&
        suggestions.length === 0 && (
          <div className="no-suggestions">לא נמצאו תוצאות</div>
        )}
    </div>
  )
}

export default CityAutocomplete
