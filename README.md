# Kurel Tracker

Application mobile de suivi des répétitions pour groupes musicaux (chœurs, chorales, groupes de chant).

## Fonctionnalités

- **Gestion des membres** — ajout, suppression, liaison de compte
- **Gestion des morceaux** — suivi de la progression par nombre de répétitions
- **Séances** — création de séance, marquage de présence en un tap (Absent → Présent → Vocal)
- **Statistiques** — classement des membres par assiduité, avancement des morceaux
- **Partage WhatsApp** — export du tableau de suivi formaté pour WhatsApp
- **Deux rôles** — Admin (gère tout) et Membre (consulte son propre tableau de bord)
- **PWA installable** — fonctionne comme une app mobile

## Stack technique

- React 19 + Vite 7
- Tailwind CSS v4
- Supabase (authentification + base de données)
- React Router v7

## Installation

```bash
git clone <repo>
cd kurel-tracker
npm install
```

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

## Schéma Supabase

Créez les tables suivantes dans votre projet Supabase :

```sql
-- Groupes
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  admin_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Membres
create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  name text not null,
  email text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Morceaux
create table songs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  name text not null,
  target_reps integer default 10,
  created_at timestamptz default now()
);

-- Séances
create table sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  date date not null,
  created_at timestamptz default now()
);

-- Présences
create table attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  status text check (status in ('absent', 'present', 'vocal')) default 'absent'
);
```

Activez **Row Level Security** et ajoutez des policies pour que chaque admin n'accède qu'à ses propres données.

## Logique de rôles

- **Premier login** → l'utilisateur devient automatiquement admin d'un nouveau groupe
- **Membre avec email** → si un admin ajoute un membre avec son email, ce membre peut se créer un compte et sera automatiquement lié à ce groupe en lecture seule
- **Admin** → accès complet (gestion membres, morceaux, séances, stats)
- **Membre** → tableau de bord personnel uniquement

## Scripts

```bash
npm run dev       # Démarrer le serveur de développement
npm run build     # Build de production
npm run preview   # Prévisualiser le build
npm run lint      # Linter ESLint
```
