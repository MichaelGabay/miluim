import { useState, useEffect } from 'react'
import axios from 'axios'
import BusinessCard from '../components/BusinessCard'
import BusinessForm from '../components/BusinessForm'
import SearchFilter from '../components/SearchFilter'
import Loader from '../components/Loader'
import { API_URL } from '../config'
import './Businesses.css'

function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [filteredBusinesses, setFilteredBusinesses] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [fieldsOfWork, setFieldsOfWork] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    filterBusinesses()
  }, [businesses, searchTerm, selectedField])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/businesses`)
      setBusinesses(response.data)
      
      // Extract unique fields of work
      const fields = [...new Set(response.data.map(b => b.fieldOfWork))].sort()
      setFieldsOfWork(fields)
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError('שגיאה בטעינת הנתונים')
    } finally {
      setLoading(false)
    }
  }

  const filterBusinesses = () => {
    let filtered = [...businesses]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.fieldOfWork.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.city && business.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (business.notes && business.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by selected field
    if (selectedField) {
      filtered = filtered.filter(business =>
        business.fieldOfWork === selectedField
      )
    }

    setFilteredBusinesses(filtered)
  }

  const handleAddBusiness = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/businesses`, formData)
      setBusinesses(prev => [response.data, ...prev])
      
      // Update fields of work if new
      if (!fieldsOfWork.includes(formData.fieldOfWork)) {
        setFieldsOfWork(prev => [...prev, formData.fieldOfWork].sort())
      }
    } catch (err) {
      console.error('Error adding business:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="businesses-page">
        <div className="container">
          <div className="loading">
            <Loader size="large" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="businesses-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="businesses-page">
      <div className="container">
        <div className="businesses-header">
          <h1>נעזרים במשפחה</h1>
          <p className="subtitle">מצאו אנשי מקצוע מהקהילה</p>
        </div>

        <div className="actions-bar">
          <button 
            className="add-business-btn"
            onClick={() => setIsFormOpen(true)}
          >
            הוסף את העסק שלך
          </button>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          fieldsOfWork={fieldsOfWork}
          selectedField={selectedField}
          onFieldChange={setSelectedField}
        />

        {filteredBusinesses.length === 0 ? (
          <div className="no-results">
            <p>לא נמצאו תוצאות</p>
          </div>
        ) : (
          <div className="businesses-grid">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business._id} business={business} />
            ))}
          </div>
        )}
      </div>

      <BusinessForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddBusiness}
        fieldsOfWork={fieldsOfWork}
      />
    </div>
  )
}

export default Businesses

