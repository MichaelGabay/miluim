import { Link } from "react-router-dom"
import "./NotFound.css"

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">הדף לא נמצא</h2>
        <p className="not-found-message">
          הדף שחיפשת לא קיים או הועבר למיקום אחר.
        </p>
        <Link to="/" className="not-found-link">
          חזרה לעמוד הבית
        </Link>
      </div>
    </div>
  )
}

export default NotFound

