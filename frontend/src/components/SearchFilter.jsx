import { useState, useRef, useEffect } from "react"
import "./SearchFilter.css"

function SearchFilter({
  searchTerm,
  onSearchChange,
  fieldsOfWork,
  selectedField,
  onFieldChange,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectSearchTerm, setSelectSearchTerm] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const optionsRef = useRef([])
  const inputRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
        setSelectSearchTerm("")
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  // Filter fields based on search term
  const filteredFields = fieldsOfWork.filter((field) =>
    field.toLowerCase().includes(selectSearchTerm.toLowerCase())
  )

  // Reset highlighted index when filtered fields change
  useEffect(() => {
    if (
      filteredFields.length > 0 &&
      highlightedIndex >= filteredFields.length
    ) {
      setHighlightedIndex(-1)
    }
  }, [filteredFields, highlightedIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isDropdownOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => {
            const next = prev < filteredFields.length - 1 ? prev + 1 : 0
            // Scroll into view
            if (optionsRef.current[next]) {
              optionsRef.current[next].scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              })
            }
            return next
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredFields.length - 1
            // Scroll into view
            if (optionsRef.current[next]) {
              optionsRef.current[next].scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              })
            }
            return next
          })
          break
        case "Enter":
          e.preventDefault()
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredFields.length
          ) {
            onFieldChange(filteredFields[highlightedIndex])
            setIsDropdownOpen(false)
            setSelectSearchTerm("")
            setHighlightedIndex(-1)
            // Remove focus from input when option is selected
            if (inputRef.current) {
              inputRef.current.blur()
            }
          }
          break
        case "Escape":
          e.preventDefault()
          setIsDropdownOpen(false)
          setSelectSearchTerm("")
          setHighlightedIndex(-1)
          break
        default:
          break
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDropdownOpen, filteredFields, highlightedIndex, onFieldChange])

  const handleSelectField = (field, e) => {
    e.preventDefault()
    e.stopPropagation()
    onFieldChange(field)
    setIsDropdownOpen(false)
    setSelectSearchTerm("")
    // Remove focus from input when option is selected
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleInputFocus = (e) => {
    setIsDropdownOpen(true)
    setHighlightedIndex(-1)
    // If there's a selected field and search term is empty, show the selected value
    // This allows the user to see and edit the selected value
    if (selectSearchTerm === "" && selectedField) {
      // Select all text so user can easily replace it
      e.target.select()
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSelectSearchTerm(value)
    setIsDropdownOpen(true)
    setHighlightedIndex(-1)

    // If input is cleared, select "all fields" (empty)
    if (value === "") {
      onFieldChange("")
    }
  }

  const handleInputBlur = () => {
    // Close dropdown when input loses focus
    setTimeout(() => {
      setIsDropdownOpen(false)
      setSelectSearchTerm("")
      setHighlightedIndex(-1)
    }, 150)
  }

  const displayValue = isDropdownOpen
    ? selectSearchTerm || selectedField || ""
    : selectedField || ""

  return (
    <div className="search-filter">
      <div className="search-group">
        <input
          type="text"
          placeholder="חיפוש לפי שם, מקצוע, עיר..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filter-group">
        <label htmlFor="fieldFilter">פילטר לפי מקצוע:</label>
        <div className="searchable-select-wrapper" ref={dropdownRef}>
          <div className="filter-select-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              id="fieldFilter"
              className="filter-select-input"
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="כל המקצועות"
            />
            <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
          </div>
          {isDropdownOpen && (
            <div className="select-dropdown">
              <div className="select-options">
                {filteredFields.length > 0 ? (
                  filteredFields.map((field, index) => {
                    // Only show "selected" class if search term is empty (no active typing/deleting)
                    const isSelected =
                      selectedField === field && selectSearchTerm === ""
                    return (
                      <button
                        key={index}
                        ref={(el) => (optionsRef.current[index] = el)}
                        type="button"
                        className={`select-option ${
                          isSelected ? "selected" : ""
                        } ${highlightedIndex === index ? "highlighted" : ""}`}
                        onMouseDown={(e) => handleSelectField(field, e)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {field}
                      </button>
                    )
                  })
                ) : (
                  <div className="select-no-results">לא נמצאו תוצאות</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchFilter
