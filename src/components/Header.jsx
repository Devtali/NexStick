import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import styles from './Header.module.css'

/**
 * Header Component
 * @param {string} title - Titre principal du header
 * @param {string} [subtitle] - Sous-titre optionnel
 * @param {string} [backScreen] - Écran de destination du bouton retour (défaut: 'feed')
 * @param {React.ReactNode} [right] - Contenu à afficher à droite
 * @param {function} [backFn] - Fonction personnalisée pour le bouton retour
 */
export default function Header({ title, subtitle, backScreen, right, backFn }) {
  const { navigate } = useApp()
  
  const handleBack = backFn || (() => navigate(backScreen || 'feed'))

  return (
    <header className={styles.header}>
      <button 
        onClick={handleBack}
        className={styles.backButton}
        aria-label="Retour à l'écran précédent"
        type="button"
      >
        <ArrowLeft size={16} aria-hidden="true" />
      </button>
      
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {right && <div className={styles.rightSection}>{right}</div>}
    </header>
  )
}