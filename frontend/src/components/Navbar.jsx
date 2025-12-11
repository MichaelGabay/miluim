import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <img
            src="/חשמונאים - סיכת חיר לבן -ללא רקע.png"
            alt="Logo"
            className="logo-image"
          />
        </Link>
        <button
          className={`navbar-toggle ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {isOpen && (
          <div
            className="navbar-overlay"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        <ul className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <li>
            <Link
              to="/businesses"
              className={location.pathname === "/businesses" ? "active" : ""}
              onClick={() => setIsOpen(false)}
            >
              נעזרים במשפחה
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
