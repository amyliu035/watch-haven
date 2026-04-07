'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MovieForm from '@/components/MovieForm'
import styles from './dashboard.module.css'

type Movie = {
  id: string
  title: string
  rating: number
  entry_time: string
  related_urls: string[] | null
}

export default function Dashboard() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | undefined>('')
  
  const router = useRouter()
  const supabase = createClient()

  async function fetchMovies() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUserEmail(user.email)
      
      const { data, error } = await supabase
        .from('watched_movies')
        .select('*')
        .order('entry_time', { ascending: false })
        
      if (!error && data) {
        setMovies(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function getFormattedDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Watch Haven</h1>
          <div className={styles.userSection}>
            <span className={styles.userEmail}>{userEmail}</span>
            <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <MovieForm onMovieAdded={fetchMovies} />

        <div className={styles.movieList}>
          <h2 className={styles.listTitle}>Your Movies</h2>
          
          {loading ? (
            <div className={styles.loadingState}>Loading movies...</div>
          ) : movies.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't added any movies yet.</p>
              <p>Start tracking your watchlist today!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {movies.map((movie) => (
                <div key={movie.id} className={styles.movieCard}>
                  <div className={styles.movieHeader}>
                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                    <div className={styles.ratingBadge}>★ {movie.rating}/10</div>
                  </div>
                  
                  <div className={styles.movieMeta}>
                    <p>Watched: {getFormattedDate(movie.entry_time)}</p>
                  </div>
                  
                  {movie.related_urls && movie.related_urls.length > 0 && (
                    <div className={styles.urls}>
                      <h4>Links:</h4>
                      <ul>
                        {movie.related_urls.map((url, i) => {
                          try {
                            const hostname = new URL(url).hostname;
                            return (
                              <li key={i}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  {hostname}
                                </a>
                              </li>
                            );
                          } catch {
                            return (
                              <li key={i}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  {url}
                                </a>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
