'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './MovieForm.module.css'

export default function MovieForm({ onMovieAdded }: { onMovieAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [rating, setRating] = useState('5')
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const relatedUrls = urls.split(',').map(url => url.trim()).filter(url => url !== '')

    const { error: insertError } = await supabase
      .from('watched_movies')
      .insert({
        title,
        rating: parseInt(rating),
        related_urls: relatedUrls.length > 0 ? relatedUrls : null
      })
      
    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      setTitle('')
      setRating('5')
      setUrls('')
      setLoading(false)
      onMovieAdded()
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Add New Movie</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label htmlFor="title">Movie Title</label>
          <input 
            id="title" 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            placeholder="e.g. Inception"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="rating">Rating (1-10)</label>
          <input 
            id="rating" 
            type="number" 
            min="1" 
            max="10" 
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
            required 
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="urls">Related URLs (comma-separated)</label>
          <input 
            id="urls" 
            type="text" 
            value={urls} 
            onChange={(e) => setUrls(e.target.value)} 
            placeholder="https://imdb.com/..., https://youtube.com/..."
          />
        </div>
        
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Adding...' : 'Add Movie'}
        </button>
      </form>
    </div>
  )
}
