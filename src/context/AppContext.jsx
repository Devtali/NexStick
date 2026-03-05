import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, ADMIN_EMAIL } from '../supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('splash')
  const [screenParams, setScreenParams] = useState({})
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setScreen('splash')
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      if (data.is_banned) {
        await supabase.auth.signOut()
        showToast('Votre compte a été suspendu.', 'error')
      } else {
        setScreen('feed')
      }
    }
    setLoading(false)
  }

  const navigate = (newScreen, params = {}) => {
    setScreenParams(params)
    setScreen(newScreen)
  }

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000)
  }

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.is_admin

  const refreshProfile = () => user && fetchProfile(user.id)

  return (
    <AppContext.Provider value={{
      screen, navigate, screenParams,
      user, profile, isAdmin, loading,
      toast, showToast,
      refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
