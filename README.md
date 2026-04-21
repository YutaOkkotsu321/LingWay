# English Learning App

Comprehensive English learning platform built with **Angular 17** (frontend) and **Django + DRF** (backend).

## Group

| Member | Role |
|--------|------|
| Alpenov Ruslan | Frontend (Angular) |
| Sarmanov Turar | Backend (Django) |
| Karbuzov Dastan | Backend + DB |

---

## Quick Start

### Backend
```bash
cd backend
bash start.sh
# Server runs at http://localhost:8000
# Demo credentials: demo / demo1234
```

### Frontend
```bash
cd frontend
npm install
npm start
# App runs at http://localhost:4200
```

> Run backend first, then frontend.

---

## Project Structure

```
english-learning-app/
├── frontend/                     # Angular frontend
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── models/index.ts           # TypeScript interfaces
│   │       │   ├── interceptors/
│   │       │   │   └── auth.interceptor.ts   # JWT interceptor
│   │       │   └── guards/auth.guard.ts      # Route protection
│   │       ├── services/
│   │       │   ├── auth.service.ts           # Login, Register, Profile
│   │       │   └── learning.service.ts       # Grammar, Vocabulary, Flashcards
│   │       └── components/
│   │           ├── login/
│   │           ├── register/
│   │           ├── grammar/
│   │           ├── grammar-detail/
│   │           ├── vocabulary/
│   │           ├── flashcards/
│   │           ├── profile/
│   │           └── navbar/
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── backend/                      # Django backend
    ├── api/
    │   ├── models.py             # 8 models
    │   ├── serializers.py        # 4 plain + 6 ModelSerializer
    │   ├── views/
    │   │   ├── auth_views.py     # 4 FBV + 2 CBV
    │   │   └── learning_views.py # 4 FBV + 5 CBV
    │   ├── urls.py               # 16 endpoints
    │   └── admin.py
    ├── postman_collection.json   # All API requests with example responses
    ├── requirements.txt
    └── start.sh
```

---

## Frontend Requirements Coverage

### Routes — 7 (requirement: ≥3)
| Route | Component | Protected |
|-------|-----------|-----------|
| `/login` | LoginComponent | No |
| `/register` | RegisterComponent | No |
| `/grammar` | GrammarComponent | Yes |
| `/grammar/:id` | GrammarDetailComponent | Yes |
| `/vocabulary` | VocabularyComponent | Yes |
| `/flashcards` | FlashcardsComponent | Yes |
| `/profile` | ProfileComponent | Yes |

### Click Events → API Requests — 12 (requirement: ≥4)
| # | Event | Endpoint |
|---|-------|----------|
| 1 | Login | `POST /api/auth/login/` |
| 2 | Register | `POST /api/auth/register/` |
| 3 | Logout | `POST /api/auth/logout/` |
| 4 | Open grammar topic | `GET /api/grammar/:id/` |
| 5 | Search vocabulary | `GET /api/vocabulary/?search=` |
| 6 | Filter by category | `GET /api/vocabulary/?category=` |
| 7 | Toggle favorite word | `POST /api/vocabulary/:id/favorite/` |
| 8 | Shuffle flashcards | `GET /api/flashcards/?shuffle=true` |
| 9 | Mark mastered | `POST /api/flashcards/:id/master/` |
| 10 | Mark needs practice | `POST /api/flashcards/:id/practice/` |
| 11 | Save profile | `PATCH /api/auth/me/` |
| 12 | Change password | `POST /api/auth/change-password/` |

### Form Controls `[(ngModel)]` — 11 (requirement: ≥4)
| # | Field | Component |
|---|-------|-----------|
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

### Other Frontend Requirements
| Requirement | Implementation |
|-------------|---------------|
| Angular Services (HttpClient) | `AuthService` + `LearningService` (2 services) |
| JWT HTTP Interceptor | `auth.interceptor.ts` — attaches `Authorization: Bearer` to all requests, redirects on 401 |
| `@for` / `@if` | Every component — grammar list, vocabulary grid, flashcard dots, loading states |
| Error handling | `catchError` on all API calls, error banners in UI, mock fallback in dev |
| CSS styling | Full dark theme, animations, responsive grid layout |

---

## Backend Requirements Coverage

### Models — 8 (requirement: ≥4)
| Model | Description |
|-------|-------------|
| `UserProfile` | Extended user info (displayName, bio, avatar) |
| `GrammarTopic` | Topic with level and category |
| `GrammarRule` | Grammar rule — **FK → GrammarTopic** |
| `Exercise` | Quiz exercise — **FK → GrammarTopic** |
| `VocabularyWord` | Word with custom manager |
| `UserFavoriteWord` | User favorites — **FK → User, FK → VocabularyWord** |
| `Flashcard` | Flashcard question/answer |
| `UserFlashcardProgress` | Per-user progress — **FK → User, FK → Flashcard** |

**ForeignKey relationships: 7** (requirement: ≥2)  
**Custom model manager:** `VocabularyWordManager` — `.by_category()`, `.search()`

### Serializers — 10 (requirement: ≥4)
| Type | Serializers |
|------|------------|
| `serializers.Serializer` (4) | `LoginSerializer`, `RegisterSerializer`, `ChangePasswordSerializer`, `UpdateProfileSerializer` |
| `serializers.ModelSerializer` (6) | `UserSerializer`, `GrammarRuleSerializer`, `ExerciseSerializer`, `GrammarTopicSerializer`, `VocabularyWordSerializer`, `FlashcardSerializer` |

### Views — 13 (requirement: ≥4)
| Type | Views |
|------|-------|
| FBV — `@api_view` (8) | `login_view`, `register_view`, `logout_view`, `change_password_view`, `toggle_favorite_view`, `flashcard_master_view`, `flashcard_practice_view`, `flashcard_reset_view` |
| CBV — `APIView` (5) | `UserProfileView`, `GrammarTopicListView`, `GrammarTopicDetailView`, `VocabularyListView`, `FlashcardListView` |

### Other Backend Requirements
| Requirement | Implementation |
|-------------|---------------|
| Token-based auth | JWT (SimpleJWT) — login + logout (blacklist) + refresh |
| Full CRUD | `GrammarTopic` — GET list, GET detail, PUT, DELETE |
| Link to authenticated user | `UserFavoriteWord`, `UserFlashcardProgress` linked to `request.user` |
| CORS | `django-cors-headers` configured for `localhost:4200` |
| Postman collection | `backend/postman_collection.json` — 16 endpoints with example responses |

---

## API Endpoints

```
# Auth
POST   /api/auth/login/
POST   /api/auth/register/
POST   /api/auth/logout/
GET    /api/auth/me/
PATCH  /api/auth/me/
POST   /api/auth/token/refresh/
POST   /api/auth/change-password/

# Grammar
GET    /api/grammar/
GET    /api/grammar/:id/
PUT    /api/grammar/:id/
DELETE /api/grammar/:id/

# Vocabulary
GET    /api/vocabulary/?category=business|academic|everyday
GET    /api/vocabulary/?search=query
GET    /api/vocabulary/favorites/
POST   /api/vocabulary/:id/favorite/

# Flashcards
GET    /api/flashcards/
GET    /api/flashcards/?shuffle=true
POST   /api/flashcards/:id/master/
POST   /api/flashcards/:id/practice/
POST   /api/flashcards/reset/
```

All endpoints except `/auth/login/` and `/auth/register/` require:
```
Authorization: Bearer <access_token>
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, FormsModule, RxJS |
| Backend | Python 3.14, Django 5.1, Django REST Framework 3.15 |
| Auth | JWT (djangorestframework-simplejwt) |
| CORS | django-cors-headers |
| Database | SQLite (development) |