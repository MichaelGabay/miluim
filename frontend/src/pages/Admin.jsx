import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BusinessForm from '../components/BusinessForm'
import './Admin.css'

const API_URL = 'http://localhost:5000/api'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businesses, setBusinesses] = useState([])
  const [fieldsOfWork, setFieldsOfWork] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBusinesses()
    }
  }, [isAuthenticated])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      axios.get(`${API_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('adminToken')
          setIsAuthenticated(false)
        })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        email,
        password
      })
      
      localStorage.setItem('adminToken', response.data.token)
      setIsAuthenticated(true)
    } catch (err) {
      setError('אימייל או סיסמה שגויים')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
    navigate('/')
  }

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(`${API_URL}/businesses`)
      setBusinesses(response.data)
      
      // Extract unique fields of work
      const fields = [...new Set(response.data.map(b => b.fieldOfWork).filter(Boolean))].sort()
      setFieldsOfWork(fields)
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError('שגיאה בטעינת הנתונים')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק עסק זה?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${API_URL}/businesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBusinesses(businesses.filter(b => b._id !== id))
    } catch (err) {
      console.error('Error deleting business:', err)
      alert('שגיאה במחיקת העסק')
    }
  }

  const handleEdit = (business) => {
    setEditingBusiness(business)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (editingBusiness) {
        // Update existing
        await axios.put(`${API_URL}/businesses/${editingBusiness._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBusinesses(businesses.map(b => 
          b._id === editingBusiness._id ? { ...b, ...formData } : b
        ))
        // Update fields of work if new
        if (formData.fieldOfWork && !fieldsOfWork.includes(formData.fieldOfWork)) {
          setFieldsOfWork(prev => [...prev, formData.fieldOfWork].sort())
        }
      } else {
        // Create new
        const response = await axios.post(`${API_URL}/businesses`, formData)
        setBusinesses([response.data, ...businesses])
        // Update fields of work if new
        if (formData.fieldOfWork && !fieldsOfWork.includes(formData.fieldOfWork)) {
          setFieldsOfWork(prev => [...prev, formData.fieldOfWork].sort())
        }
      }
      
      setEditingBusiness(null)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Error saving business:', err)
      throw err
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingBusiness(null)
  }

  // Filter businesses based on search term (fieldOfWork, city, or notes)
  const filteredBusinesses = businesses.filter(business => {
    if (!searchTerm.trim()) return true
    
    const search = searchTerm.toLowerCase()
    const fieldOfWork = (business.fieldOfWork || '').toLowerCase()
    const city = (business.city || '').toLowerCase()
    const notes = (business.notes || '').toLowerCase()
    
    return fieldOfWork.includes(search) || 
           city.includes(search) || 
           notes.includes(search)
  })

  if (!isAuthenticated) {
    return (
      <div className="admin">
        <div className="admin-container">
          <div className="login-card">
            <h2>התחברות למערכת ניהול</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">אימייל</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">סיסמה</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="login-error-message">{error}</div>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'מתחבר...' : 'התחבר'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <div className="admin-header">
          <h1>ניהול עסקים</h1>
          <div className="admin-actions">
            <button 
              className="btn-primary"
              onClick={() => setIsFormOpen(true)}
            >
              הוסף עסק חדש
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              התנתק
            </button>
          </div>
        </div>

        <div className="admin-search-container">
          <input
            type="text"
            placeholder="חיפוש לפי מקצוע, עיר או הערות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="businesses-table-container">
          {businesses.length === 0 ? (
            <div className="no-data">אין עסקים במערכת</div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="no-data">לא נמצאו תוצאות לחיפוש</div>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>תחום עיסוק</th>
                  <th>עיר</th>
                  <th>הערות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map(business => (
                  <tr key={business._id}>
                    <td>{business.name}</td>
                    <td>{business.phone}</td>
                    <td>{business.fieldOfWork}</td>
                    <td>{business.city || '-'}</td>
                    <td className="notes-cell">{business.notes || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEdit(business)}
                        >
                          ערוך
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(business._id)}
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BusinessForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingBusiness}
        fieldsOfWork={fieldsOfWork}
      />
    </div>
  )
}

export default Admin

