# 🌍 English Learning — Angular Frontend

Comprehensive English learning platform built with **Angular 17** (standalone components).

## 👥 Group

| Member | Role |
|--------|------|
| _______| Frontend (Angular) |
| _______| Backend (Django) |
| _______| Backend + DB |

---

## 🚀 Quick Start

```bash
npm install
npm start  
```

App runs at **http://localhost:4200**

Backend expected at **http://localhost:8000/api**

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/index.ts          # All TypeScript interfaces
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # JWT interceptor (attaches Bearer token)
│   └── guards/
│       └── auth.guard.ts        # Route protection
├── services/
│   ├── auth.service.ts          # Service #1: Login, Register, Logout, Profile
│   └── learning.service.ts      # Service #2: Grammar, Vocabulary, Flashcards
└── components/
    ├── navbar/                  # Top navigation + logout
    ├── login/                   # Login form
    ├── register/                # Registration form
    ├── grammar/                 # Grammar topics list
    ├── grammar-detail/          # Grammar topic detail
    ├── vocabulary/              # Vocabulary builder
    ├── flashcards/              # Interactive flashcards
    └── profile/                 # User profile & settings
```

---

## ✅ Frontend Requirements Coverage

### Routes (6 named routes ✓)
| Route | Component |
|-------|-----------|
| `/login` | LoginComponent |
| `/register` | RegisterComponent |
| `/grammar` | GrammarComponent |
| `/grammar/:id` | GrammarDetailComponent |
| `/vocabulary` | VocabularyComponent |
| `/flashcards` | FlashcardsComponent |
| `/profile` | ProfileComponent |

### Click Events → API Requests (10+ ✓)
1. **Login** `login()` → `POST /api/auth/login/`
2. **Register** `register()` → `POST /api/auth/register/`
3. **Logout** `logout()` → `POST /api/auth/logout/`
4. **Learn More** `openTopic()` → `GET /api/grammar/:id/`
5. **Search vocabulary** `onSearch()` → `GET /api/vocabulary/?search=`
6. **Category filter** `selectCategory()` → `GET /api/vocabulary/?category=`
7. **Toggle favorite** `toggleFavorite()` → `POST /api/vocabulary/:id/favorite/`
8. **Shuffle cards** `shuffle()` → `GET /api/flashcards/?shuffle=true`
9. **Mark mastered** `markMastered()` → `POST /api/flashcards/:id/master/`
10. **Mark needs practice** `markNeedsPractice()` → `POST /api/flashcards/:id/practice/`
11. **Save profile** `saveProfile()` → `PATCH /api/auth/me/`
12. **Change password** `changePassword()` → `POST /api/auth/change-password/`

### Form Controls with `[(ngModel)]` (11 ✓)
| # | Control | Component |
|---|---------|-----------|
| 1 | Username | Login |
| 2 | Password | Login |
| 3 | Username | Register |
| 4 | Email | Register |
| 5 | Password | Register |
| 6 | Confirm Password | Register |
| 7 | Search | Vocabulary |
| 8 | Display Name | Profile |
| 9 | Bio | Profile |
| 10 | Current Password | Profile |
| 11 | New Password | Profile |

### Angular Services with HttpClient (2 ✓)
- **AuthService** — Authentication, user profile
- **LearningService** — Grammar, vocabulary, flashcards

### JWT Authentication (✓)
- `auth.interceptor.ts` — attaches `Authorization: Bearer <token>` to all requests
- Redirects to `/login` on 401 responses
- Token stored in `localStorage`

### `@for` and `@if` (✓)
- Grammar topics grid: `@for (topic of filteredTopics; track topic.id)`
- Vocabulary words: `@for (word of svc.vocabulary(); track word.id)`
- Flashcard dots: `@for (card of svc.flashcards(); track card.id)`
- Error states: `@if (svc.apiError())`
- Loading skeletons: `@if (svc.isLoading())`

### Error Handling (✓)
- All API calls wrapped in `catchError`
- Error banners shown to user
- Mock data fallback when backend is unavailable (for development)
- 401 handling in interceptor

---

## 🔌 API Endpoints Expected from Backend

```
POST   /api/auth/login/
POST   /api/auth/register/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
GET    /api/auth/me/
PATCH  /api/auth/me/
POST   /api/auth/change-password/

GET    /api/grammar/
GET    /api/grammar/:id/

GET    /api/vocabulary/?category=business|academic|everyday
GET    /api/vocabulary/?search=query
POST   /api/vocabulary/:id/favorite/

GET    /api/flashcards/
GET    /api/flashcards/?shuffle=true
POST   /api/flashcards/:id/master/
POST   /api/flashcards/:id/practice/
POST   /api/flashcards/reset/
```

> **Note:** All endpoints require `Authorization: Bearer <token>` header (added automatically by interceptor), except `/login` and `/register`.

---

## 🎨 Design

Dark theme matching the provided mockups:
- Background: `#13141f`
- Cards: `#1e2038`
- Accent: Purple gradient (`#7c3aed` → `#a855f7`)
- Font: Sora (Google Fonts)
