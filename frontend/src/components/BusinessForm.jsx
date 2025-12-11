import { useState, useEffect } from "react"
import CityAutocomplete from "./CityAutocomplete"
import FieldOfWorkAutocomplete from "./FieldOfWorkAutocomplete"
import "./BusinessForm.css"

function BusinessForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  fieldsOfWork = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    fieldOfWork: "",
    city: "",
    notes: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mouseDownInside, setMouseDownInside] = useState(false)

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        fieldOfWork: initialData.fieldOfWork || "",
        city: initialData.city || "",
        notes: initialData.notes || "",
      })
    } else {
      setFormData({
        name: "",
        phone: "",
        fieldOfWork: "",
        city: "",
        notes: "",
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "שם הוא שדה חובה"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "מספר טלפון הוא שדה חובה"
    } else if (!/^[\d\s\-]+$/.test(formData.phone)) {
      newErrors.phone = "מספר טלפון לא תקין"
    }

    if (!formData.fieldOfWork.trim()) {
      newErrors.fieldOfWork = "תחום עיסוק הוא שדה חובה"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({
        name: "",
        phone: "",
        fieldOfWork: "",
        city: "",
        notes: "",
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayMouseDown = (e) => {
    // אם הלחיצה הייתה על ה-overlay (לא על המודל עצמו)
    if (e.target === e.currentTarget) {
      setMouseDownInside(false)
    }
  }

  const handleOverlayMouseUp = (e) => {
    // אם הלחיצה התחילה על ה-overlay (לא על המודל), סגור את המודל
    if (e.target === e.currentTarget && !mouseDownInside) {
      onClose()
    }
    setMouseDownInside(false)
  }

  const handleModalMouseDown = (e) => {
    // אם הלחיצה הייתה בתוך המודל, סמן זאת
    setMouseDownInside(true)
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className="modal-content" onMouseDown={handleModalMouseDown}>
        <div className="modal-header">
          <h2>{initialData ? "ערוך עסק" : "הוסף את העסק שלך"}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="business-form">
          <div className="form-group">
            <label htmlFor="name">שם *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="business-form-error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">מספר טלפון *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "error" : ""}
              placeholder="050-1234567"
            />
            {errors.phone && (
              <span className="business-form-error-message">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fieldOfWork">תחום עיסוק *</label>
            <FieldOfWorkAutocomplete
              value={formData.fieldOfWork}
              onChange={handleChange}
              error={errors.fieldOfWork}
              placeholder="הקלד תחום עיסוק..."
              fieldsOfWork={fieldsOfWork}
            />
            {errors.fieldOfWork && (
              <span className="business-form-error-message">
                {errors.fieldOfWork}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="city">עיר מגורים</label>
            <CityAutocomplete
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="הקלד שם עיר..."
            />
            {errors.city && (
              <span className="business-form-error-message">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">הערות נוספות</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              ביטול
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "שולח..." : "שלח"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BusinessForm
