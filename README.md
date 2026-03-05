# Nexus Stickers v2 — Plateforme complète de stickers WhatsApp

> Application sociale de création et partage de stickers WhatsApp, avec profils utilisateurs, feed public, système d'abonnements et panneau d'administration.

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🔐 Authentification | Inscription/connexion avec vérification email (Supabase Auth) |
| 📣 Telegram | Redirection vers @nexuslabstech à l'onboarding |
| 📦 Création de packs | Jusqu'à 30 stickers par pack avec l'éditeur canvas |
| 📤 Export WhatsApp | Téléchargement ZIP compatible Sticker Maker (Android) |
| 🌐 Feed public | Gallery des packs partagés avec réactions |
| 👤 Profils Instagram-like | Stats, followers, visites, téléchargements |
| 🔔 Réactions | 6 emojis de réaction sur chaque pack |
| 👥 Follow/Unfollow | Système d'abonnements entre utilisateurs |
| 🚩 Signalements | Signalement de contenus inappropriés |
| 💬 Communauté | Forum public pour avis et signalements |
| 🛡️ Panneau Admin | Annonces, bannissement, gestion des signalements |

---

## Stack Technique

| Outil | Rôle |
|---|---|
| React 18 + Vite | Interface utilisateur |
| Supabase | Base de données, Auth, Storage |
| JSZip | Génération du ZIP de stickers |
| lucide-react | Icônes |
| HTML5 Canvas | Éditeur de stickers |

---

## Installation locale

```bash
git clone https://github.com/<votre-pseudo>/nexus-stickers.git
cd nexus-stickers
npm install
cp .env.example .env
# Remplissez .env avec vos clés Supabase
npm run dev
```

---

## Configuration Supabase (OBLIGATOIRE)

### 1. Créer un projet Supabase
Rendez-vous sur [supabase.com](https://supabase.com), créez un projet gratuit.

### 2. Configurer la base de données
Dans le tableau de bord Supabase → **SQL Editor** → **New query** :
Copiez-collez tout le contenu de `schema.sql` et exécutez.

### 3. Créer les Storage Buckets
Dans **Storage** → **New bucket** :
- Nom : `stickers` → ✅ Public
- Nom : `avatars`  → ✅ Public

Pour chaque bucket, dans **Policies** → **New policy** → **For full customization** :
```sql
-- Bucket stickers : autoriser upload pour utilisateurs connectés
create policy "Upload stickers" on storage.objects for insert with check (auth.role() = 'authenticated');
create policy "Lire stickers" on storage.objects for select using (true);
-- Idem pour avatars
```

### 4. Activer la vérification email
Dans **Authentication** → **Email** : activez "Confirm email".

### 5. Variables d'environnement
Dans **Settings** → **API**, copiez :
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### 6. Compte Administrateur Nexus Labs
1. Créez un compte dans l'application avec l'email `nexuslabsword@gmail.com`
2. Dans Supabase SQL Editor, exécutez :
```sql
UPDATE profiles SET is_admin = true WHERE username = 'nexuslabsword';
```
> ⚠️ Ne mettez JAMAIS votre mot de passe dans le code source.

---

## Déploiement sur Vercel

1. Poussez ce dépôt sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com) → **Add New Project**
3. Sélectionnez le dépôt → **Environment Variables** :
   - `VITE_SUPABASE_URL` → votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` → votre clé Supabase
4. Cliquez **Deploy**

---

## Import WhatsApp

Les navigateurs web ne peuvent pas envoyer directement des packs à WhatsApp.
Le ZIP téléchargé depuis "Mes Packs" est compatible avec **Sticker Maker** (Android) :
1. Installez [Sticker Maker](https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp)
2. Créez un pack → importez les WebP du ZIP
3. Envoyez à WhatsApp via l'app

---

## Structure du projet

```
src/
├── lib/supabase.js          # Client Supabase + constantes
├── context/AppContext.jsx   # État global & navigation
├── App.jsx                  # Router principal
├── components/
│   ├── Navbar.jsx
│   ├── Header.jsx
│   ├── PackCard.jsx
│   ├── StickerCanvas.jsx
│   └── Toast.jsx
└── screens/
    ├── SplashScreen.jsx     # Splash + Telegram
    ├── AuthScreen.jsx       # Login / Register
    ├── FeedScreen.jsx       # Explorer public
    ├── CreateScreen.jsx     # Créer un pack
    ├── MyPacksScreen.jsx    # Mes packs + ZIP
    ├── PackEditorScreen.jsx # Éditeur stickers
    ├── PackDetailScreen.jsx # Détail d'un pack
    ├── ProfileScreen.jsx    # Mon profil
    ├── UserProfileScreen.jsx# Profil autre user
    ├── EditProfileScreen.jsx# Modifier profil
    ├── AdminScreen.jsx      # Panneau admin
    └── CommunityScreen.jsx  # Forum communauté
```

---

## Licence
MIT — © 2025 Nexus Labs · [t.me/nexuslabstech](https://t.me/nexuslabstech)
