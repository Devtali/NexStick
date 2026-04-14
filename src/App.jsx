import { AppProvider, useApp } from './context/AppContext'
import SplashScreen from './screens/SplashScreen'
import AuthScreen from './screens/AuthScreen'
import FeedScreen from './screens/FeedScreen'
import CreateScreen from './screens/CreateScreen'
import MyPacksScreen from './screens/MyPacksScreen'
import ProfileScreen from './screens/ProfileScreen'
import AdminScreen from './screens/AdminScreen'
import PackDetailScreen from './screens/PackDetailScreen'
import UserProfileScreen from './screens/UserProfileScreen'
import EditProfileScreen from './screens/EditProfileScreen'
import PackEditorScreen from './screens/PackEditorScreen'
import CommunityScreen from './screens/CommunityScreen'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import './index.css'

const MAIN_SCREENS = ['feed', 'create', 'mypacks', 'profile']

function AppContent() {
  const { screen, user, loading } = useApp()

  if (loading) {
    return (
      <Shell>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0d1117' }}>
          <div style={{ width:40, height:40, border:'3px solid rgba(37,211,102,0.2)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Shell>
    )
  }

  const renderScreen = () => {
    if (!user && !['splash','telegram','auth'].includes(screen)) return <SplashScreen />
    switch (screen) {
      case 'splash':     return <SplashScreen />
      case 'auth':       return <AuthScreen />
      case 'feed':       return <FeedScreen />
      case 'create':     return <CreateScreen />
      case 'mypacks':    return <MyPacksScreen />
      case 'profile':    return <ProfileScreen />
      case 'admin':      return <AdminScreen />
      case 'pack-detail':return <PackDetailScreen />
      case 'user-profile':return <UserProfileScreen />
      case 'edit-profile':return <EditProfileScreen />
      case 'pack-editor':return <PackEditorScreen />
      case 'community':  return <CommunityScreen />
      default:           return <FeedScreen />
    }
  }

  return (
    <Shell>
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0d1117', position:'relative' }}>
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {renderScreen()}
        </div>
        {user && MAIN_SCREENS.includes(screen) && <Navbar />}
        <Toast />
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div style={{
      width: Math.min(window.innerWidth, 430),
      height: '100vh',
      maxHeight: 900,
      borderRadius: window.innerWidth > 500 ? '40px' : 0,
      overflow: 'hidden',
      boxShadow: window.innerWidth > 500 ? '0 40px 100px rgba(0,0,0,0.7)' : 'none',
      position: 'relative',
    }}>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
