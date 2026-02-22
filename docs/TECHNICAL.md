# ALS Connect Tacloban — Technical Documentation

## 1. System Overview

ALS Connect Tacloban is a web-based integrated hub for the Alternative Learning System (ALS) program in Anibong, Tacloban City. It digitizes and streamlines administrative tasks, facilitates communication, and provides a centralized repository for learning materials and progress tracking.

### Key Capabilities
- **Role-based access control** (Admin, Teacher, Student)
- **User management** with bulk import/export
- **Digital learning resource repository** with categorization & search
- **Student enrollment & progress tracking** with PDF reports
- **Announcement system** with audience targeting & notifications
- **Community forum** with categories, threads, moderation
- **Two-factor authentication** (TOTP)
- **Mobile-responsive** design

---

## 2. Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | PHP | ≥ 8.2 |
| Backend Framework | Laravel | 12.x |
| Authentication | Laravel Fortify | 1.30+ |
| Frontend Framework | React | 19.x |
| Type System | TypeScript | 5.7+ |
| SSR Bridge | Inertia.js | 2.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI / shadcn | Latest |
| Route Typing | Laravel Wayfinder | 0.1.x |
| Build Tool | Vite | 7.x |
| Database | MySQL (prod) / SQLite (dev) | 8.x / 3.x |
| Testing | PHPUnit | 11.x |

### 2.2 Architecture Pattern

The application follows a **server-driven SPA** architecture using Inertia.js:

```
┌─────────────┐     Inertia     ┌──────────────────┐
│  React SPA  │ ◄────────────►  │  Laravel Backend  │
│  (Browser)  │   JSON Props    │  (Controllers)    │
└─────────────┘                 └──────┬───────────┘
                                       │
                                ┌──────▼───────────┐
                                │  Eloquent ORM     │
                                │  (Models)         │
                                └──────┬───────────┘
                                       │
                                ┌──────▼───────────┐
                                │  Database         │
                                │  (MySQL/SQLite)   │
                                └──────────────────┘
```

**Request lifecycle:**
1. Browser navigates → Laravel route → Controller
2. Controller returns `Inertia::render('PageComponent', $props)`
3. Inertia serializes props as JSON and delivers to React
4. React renders the page component with received props
5. Subsequent navigations are XHR-based (no full page reload)

### 2.3 Directory Structure

```
├── app/
│   ├── Actions/Fortify/          # Auth actions (register, reset password, etc.)
│   ├── Concerns/                 # Shared traits (validation rules)
│   ├── Http/
│   │   ├── Controllers/          # Route handlers
│   │   │   ├── Admin/            # Admin-only controllers
│   │   │   ├── Settings/         # User settings controllers
│   │   │   ├── AnnouncementController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ForumController.php
│   │   │   ├── GradebookController.php
│   │   │   ├── LibraryController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ProgressController.php
│   │   │   └── ReportController.php
│   │   ├── Middleware/           # Custom middleware (EnsureUserRole)
│   │   └── Requests/            # Form request validation
│   ├── Models/                   # Eloquent models
│   ├── Notifications/            # Notification classes
│   └── Providers/                # Service providers
├── config/                       # Laravel configuration files
├── database/
│   ├── factories/                # Model factories for testing
│   ├── migrations/               # Database schema migrations
│   └── seeders/                  # Data seeders
├── resources/
│   ├── css/                      # Tailwind CSS entry point
│   ├── js/
│   │   ├── components/           # Reusable React components (shadcn/ui)
│   │   ├── layouts/              # Page layout wrappers
│   │   ├── pages/                # Inertia page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utility functions
│   │   ├── types/                # TypeScript type definitions
│   │   └── wayfinder/            # Auto-generated route functions
│   └── views/                    # Blade templates (app shell)
├── routes/
│   ├── web.php                   # Main web routes
│   ├── settings.php              # Settings routes
│   └── console.php               # Artisan console routes
├── tests/
│   ├── Feature/                  # Feature/integration tests
│   └── Unit/                     # Unit tests
└── public/                       # Web server document root
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
users ─────────┬──── enrollments ──── learning_modules ──── subjects
               │          │
               │     progress_records
               │
               ├──── announcements
               │
               ├──── forum_threads ──── forum_categories
               │          │
               │     forum_replies
               │
               ├──── notifications
               │
               └──── learning_resources
```

### 3.2 Table Definitions

#### `users`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| name | string | Full name |
| email | string (unique) | Email address |
| email_verified_at | timestamp? | Email verification timestamp |
| password | string | Bcrypt hashed password |
| role | enum: admin, teacher, student | User role (default: student) |
| is_active | boolean | Account active status (default: true) |
| two_factor_secret | text? | Encrypted 2FA secret |
| two_factor_recovery_codes | text? | Encrypted recovery codes |
| two_factor_confirmed_at | timestamp? | 2FA confirmation timestamp |
| remember_token | string? | Remember me token |
| created_at / updated_at | timestamps | Eloquent timestamps |

#### `subjects`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| name | string | Subject name (e.g., "English", "Math") |
| slug | string (unique) | URL-friendly identifier |
| description | text? | Subject description |
| created_at / updated_at | timestamps | |

#### `learning_modules`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| subject_id | FK → subjects | Parent subject |
| created_by | FK → users | Admin/teacher who created it |
| title | string | Module title |
| slug | string (unique) | URL-friendly identifier |
| description | text? | Module description |
| level | enum: elementary, junior_high, senior_high | Target education level |
| status | enum: draft, published, archived | Publication status |
| created_at / updated_at | timestamps | |

#### `learning_resources`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| module_id | FK → learning_modules | Parent module |
| uploaded_by | FK → users | Uploader |
| title | string | Resource title |
| description | text? | Resource description |
| type | enum: pdf, video, link, document, image | Resource type |
| file_path | string? | Storage path for uploaded files |
| external_url | string? | URL for external links/videos |
| file_size | bigint? | File size in bytes |
| mime_type | string? | MIME type of file |
| sort_order | int | Display order (default: 0) |
| created_at / updated_at | timestamps | |

#### `enrollments`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| student_id | FK → users | Student being enrolled |
| module_id | FK → learning_modules | Target module |
| enrolled_by | FK → users | Teacher who enrolled the student |
| status | enum: enrolled, in_progress, completed, dropped | Enrollment status |
| completed_at | timestamp? | Completion date |
| created_at / updated_at | timestamps | |
| **UNIQUE** | (student_id, module_id) | Prevents duplicate enrollments |

#### `progress_records`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| enrollment_id | FK → enrollments | Parent enrollment |
| recorded_by | FK → users | Teacher who recorded it |
| title | string | Activity name (e.g., "Module 1 Quiz") |
| type | enum: assessment, activity, milestone | Record type |
| score | decimal(5,2)? | Score achieved (0–100) |
| max_score | decimal(8,2)? | Maximum possible score |
| remarks | text? | Teacher's notes |
| recorded_date | date | Date of activity |
| created_at / updated_at | timestamps | |

#### `announcements`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| author_id | FK → users | Author (teacher/admin) |
| title | string | Announcement title |
| body | text | Announcement content |
| audience | enum: all, students, teachers, admins | Target audience |
| is_pinned | boolean | Pin to top (default: false) |
| published_at | timestamp? | Publish date (null = draft) |
| created_at / updated_at | timestamps | |

#### `forum_categories`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| name | string | Category name |
| slug | string (unique) | URL-friendly identifier |
| description | string? | Category description |
| color | string(7) | Hex color code (default: #6366f1) |
| sort_order | int | Display order |
| created_at / updated_at | timestamps | |

#### `forum_threads`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| user_id | FK → users | Thread author |
| category_id | FK → forum_categories | Parent category |
| title | string | Thread title |
| body | text | Thread body |
| slug | string (unique) | Auto-generated from title |
| is_pinned | boolean | Pin to top (default: false) |
| is_locked | boolean | Prevent new replies (default: false) |
| created_at / updated_at | timestamps | |

#### `forum_replies`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| thread_id | FK → forum_threads | Parent thread |
| user_id | FK → users | Reply author |
| body | text | Reply content |
| created_at / updated_at | timestamps | |

#### `system_settings`
| Column | Type | Description |
|---|---|---|
| id | bigint (PK) | Auto-increment primary key |
| key | string (unique) | Setting key |
| value | text? | Setting value |
| group | string | Group name (default: "general") |
| created_at / updated_at | timestamps | |

#### `notifications` (Laravel standard)
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | UUID primary key |
| type | string | Notification class name |
| notifiable_type | string | Polymorphic type (App\Models\User) |
| notifiable_id | bigint | User ID |
| data | text | JSON notification payload |
| read_at | timestamp? | Read timestamp |
| created_at / updated_at | timestamps | |

---

## 4. API Routes

### 4.1 Authentication (Laravel Fortify)

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/login` | login | Login page |
| POST | `/login` | login.store | Authenticate user |
| POST | `/logout` | logout | Log out user |
| GET | `/register` | register | Registration page |
| POST | `/register` | register.store | Create new user |
| GET | `/forgot-password` | password.request | Forgot password page |
| POST | `/forgot-password` | password.email | Send reset link |
| GET | `/reset-password/{token}` | password.reset | Reset password page |
| POST | `/reset-password` | password.update | Update password |
| GET | `/email/verify` | verification.notice | Verification notice |
| GET | `/email/verify/{id}/{hash}` | verification.verify | Verify email |
| POST | `/email/verification-notification` | verification.send | Resend verification |
| GET | `/two-factor-challenge` | two-factor.login | 2FA challenge page |
| POST | `/two-factor-challenge` | two-factor.login.store | Verify 2FA code |

### 4.2 Dashboard & General

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/` | home | Landing page |
| GET | `/dashboard` | dashboard | Role-based dashboard |

### 4.3 Admin Routes (role: admin)

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/admin/users` | admin.users.index | List users |
| GET | `/admin/users/create` | admin.users.create | Create user form |
| POST | `/admin/users` | admin.users.store | Store new user |
| GET | `/admin/users/{user}` | admin.users.show | View user |
| GET | `/admin/users/{user}/edit` | admin.users.edit | Edit user form |
| PUT/PATCH | `/admin/users/{user}` | admin.users.update | Update user |
| DELETE | `/admin/users/{user}` | admin.users.destroy | Delete user |
| PATCH | `/admin/users/{user}/toggle-status` | admin.users.toggle-status | Toggle active/inactive |
| GET | `/admin/users-export` | admin.users.export | Export users CSV |
| POST | `/admin/users-import` | admin.users.import | Import users CSV |
| GET | `/admin/users-template` | admin.users.template | Download CSV template |
| GET | `/admin/modules` | admin.modules.index | List modules |
| GET | `/admin/modules/create` | admin.modules.create | Create module form |
| POST | `/admin/modules` | admin.modules.store | Store module |
| GET | `/admin/modules/{module}` | admin.modules.show | View module |
| GET | `/admin/modules/{module}/edit` | admin.modules.edit | Edit module form |
| PUT/PATCH | `/admin/modules/{module}` | admin.modules.update | Update module |
| DELETE | `/admin/modules/{module}` | admin.modules.destroy | Delete module |
| POST | `/admin/modules/{module}/resources` | admin.modules.resources.store | Upload resource |
| DELETE | `/admin/modules/{module}/resources/{resource}` | admin.modules.resources.destroy | Delete resource |
| GET | `/admin/settings` | admin.settings.index | System settings |
| PUT | `/admin/settings` | admin.settings.update | Update settings |

### 4.4 Learning Library (authenticated)

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/library` | library.index | Browse published modules |
| GET | `/library/{module}` | library.show | View module details & resources |

### 4.5 Gradebook (role: teacher, admin)

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/gradebook` | gradebook.index | Teacher's enrollment list |
| POST | `/gradebook/enroll` | gradebook.enroll | Enroll a student |
| GET | `/gradebook/{enrollment}` | gradebook.show | View enrollment details |
| POST | `/gradebook/{enrollment}/records` | gradebook.records.store | Add progress record |
| DELETE | `/gradebook/{enrollment}/records/{record}` | gradebook.records.destroy | Delete progress record |
| PATCH | `/gradebook/{enrollment}/status` | gradebook.status | Update enrollment status |

### 4.6 Student Progress (role: student)

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/progress` | progress.index | Student progress overview |
| GET | `/progress/{enrollment}` | progress.show | Enrollment detail |

### 4.7 Reports

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/reports/progress/{enrollment}` | reports.progress | PDF progress report |

### 4.8 Announcements

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/announcements` | announcements.index | List published announcements |
| GET | `/announcements/{announcement}` | announcements.show | View announcement |
| GET | `/announcements-manage` | announcements.manage | Management view (teacher/admin) |
| POST | `/announcements-manage` | announcements.store | Create announcement |
| PUT | `/announcements-manage/{announcement}` | announcements.update | Update announcement |
| DELETE | `/announcements-manage/{announcement}` | announcements.destroy | Delete announcement |
| PATCH | `/announcements-manage/{announcement}/publish` | announcements.publish | Publish draft |

### 4.9 Forum

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/forum` | forum.index | List threads |
| GET | `/forum/create` | forum.create | Create thread form |
| POST | `/forum` | forum.store | Store thread |
| GET | `/forum/{thread}` | forum.show | View thread & replies |
| POST | `/forum/{thread}/reply` | forum.reply | Post reply |
| DELETE | `/forum/threads/{thread}` | forum.threads.destroy | Delete thread |
| DELETE | `/forum/replies/{reply}` | forum.replies.destroy | Delete reply |
| PATCH | `/forum/threads/{thread}/lock` | forum.threads.lock | Toggle lock (admin) |
| PATCH | `/forum/threads/{thread}/pin` | forum.threads.pin | Toggle pin (admin) |

### 4.10 Notifications

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/notifications` | notifications.index | View all notifications |
| GET | `/notifications/unread-count` | notifications.unread-count | Get unread count (JSON) |
| PATCH | `/notifications/{id}/read` | notifications.read | Mark as read |
| POST | `/notifications/mark-all-read` | notifications.read-all | Mark all as read |

### 4.11 Settings

| Method | URI | Name | Description |
|---|---|---|---|
| GET | `/settings/profile` | profile.edit | Edit profile |
| PATCH | `/settings/profile` | profile.update | Update profile |
| DELETE | `/settings/profile` | profile.destroy | Delete account |
| GET | `/settings/password` | user-password.edit | Password page |
| PUT | `/settings/password` | user-password.update | Update password |
| GET | `/settings/two-factor` | two-factor.show | 2FA settings |
| GET | `/settings/appearance` | appearance.edit | Appearance settings |

---

## 5. Authentication & Authorization

### 5.1 Authentication via Laravel Fortify

The application uses **Laravel Fortify** as a headless authentication backend:
- **Registration** — Custom `CreateNewUser` action, requires `name`, `email`, `password`, and `role` (student or teacher)
- **Login** — Standard email/password with rate limiting
- **Email verification** — Required; verified via signed URL
- **Password reset** — Email-based token flow
- **Two-Factor Authentication** — TOTP-based (Google Authenticator compatible), with recovery codes
- **Password confirmation** — Required for sensitive operations

### 5.2 Role-Based Authorization

Three roles: `admin`, `teacher`, `student` (stored as enum on `users` table).

**Middleware: `EnsureUserRole`**
```php
// Usage in routes:
Route::middleware(['auth', EnsureUserRole::class.':admin'])->group(function () { ... });
Route::middleware(['auth', EnsureUserRole::class.':teacher,admin'])->group(function () { ... });
```

**Role capabilities:**

| Feature | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| Dashboard (admin stats) | ✓ | — | — |
| User management | ✓ | — | — |
| Module management | ✓ | — | — |
| System settings | ✓ | — | — |
| Gradebook | ✓ | ✓ | — |
| Announcements (manage) | ✓ | ✓ | — |
| Forum moderation | ✓ | — | — |
| Library (browse) | ✓ | ✓ | ✓ |
| Announcements (view) | ✓ | ✓ | ✓ |
| Forum (participate) | ✓ | ✓ | ✓ |
| Progress (own) | — | — | ✓ |
| Notifications | ✓ | ✓ | ✓ |
| Profile & settings | ✓ | ✓ | ✓ |

---

## 6. Key Models & Relationships

### User
- `enrollments()` → hasMany (as student)
- `teacherEnrollments()` → hasMany (as teacher via enrolled_by)
- `announcements()` → hasMany (as author)
- `threads()` → hasMany
- `replies()` → hasMany
- Helper methods: `isAdmin()`, `isTeacher()`, `isStudent()`

### LearningModule
- `subject()` → belongsTo Subject
- `creator()` → belongsTo User
- `resources()` → hasMany LearningResource
- `enrollments()` → hasMany Enrollment
- Scopes: `published()`, `draft()`

### Enrollment
- `student()` → belongsTo User
- `module()` → belongsTo LearningModule
- `teacher()` → belongsTo User (enrolled_by)
- `records()` → hasMany ProgressRecord
- Computed: `average_score`, `status_label`
- Scopes: `completed()`, `active()`

### Announcement
- `author()` → belongsTo User
- Scopes: `published()`, `forAudience($role)`
- Computed: `audience_label`

### ForumThread
- `user()` → belongsTo User
- `category()` → belongsTo ForumCategory
- `replies()` → hasMany ForumReply
- Auto-generates slug from title
- Scopes: `ordered()` (pinned first, then newest)

### SystemSetting
- Static: `getValue($key, $default)`, `setValue($key, $value, $group)`, `getGroup($group)`

---

## 7. Notification System

### Notification Types
1. **NewAnnouncement** — Sent when an announcement is published; targets users matching the audience
2. **NewForumReply** — Sent when someone replies to a thread; targets the thread author (not self-replies)

### Channels
- **Database** — In-app notifications stored in `notifications` table, accessible via bell icon
- **Mail** — Email notifications sent via configured mail driver

### Frontend Integration
- Notification bell in sidebar with unread count badge
- Polling interval fetches `/notifications/unread-count` every 30 seconds
- Full notification page at `/notifications` with mark-read actions

---

## 8. Testing

### 8.1 Test Suite Overview

| Category | Files | Tests | Assertions |
|---|---|---|---|
| Unit Tests | 6 | 31 | ~80 |
| Feature Tests | 18 | 136 | ~578 |
| **Total** | **24** | **167** | **658** |

### 8.2 Test Configuration

```xml
<!-- phpunit.xml key settings -->
<env name="APP_ENV" value="testing"/>
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="MAIL_MAILER" value="array"/>
<env name="CACHE_STORE" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
```

- SQLite in-memory database for fast, isolated tests
- Array drivers for mail/cache/session (no external services needed)
- `$this->withoutVite()` in base TestCase to bypass Vite manifest in tests

### 8.3 Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter=UserManagementTest

# Run specific test method
php artisan test --filter="test_admin_can_create_user"

# Run with verbose output
php artisan test -v
```

### 8.4 Test Coverage Map

| Module | Test File | Key Scenarios |
|---|---|---|
| Auth | Auth/AuthenticationTest | Login, logout, rate limiting, 2FA redirect |
| Auth | Auth/RegistrationTest | Registration with role selection |
| Auth | Auth/PasswordResetTest | Reset link, token validation, password update |
| Auth | Auth/EmailVerificationTest | Verification flow, invalid hash/user |
| Dashboard | DashboardTest | Role-based rendering, admin stats |
| Users | Admin/UserManagementTest | CRUD, search, filter, import/export, toggle status |
| Modules | Admin/ModuleManagementTest | CRUD, resource upload/delete |
| Settings | Admin/SettingsTest | View, update, authorization |
| Library | LibraryTest | Browse, search, filter, draft access control |
| Gradebook | GradebookTest | Enroll, progress records, cross-teacher auth |
| Progress | ProgressTest | Overview, detail, cross-student access |
| Reports | ReportTest | PDF generation, authorization |
| Announcements | AnnouncementTest | CRUD, audience filter, notifications, publish |
| Forum | ForumTest | Threads, replies, notifications, moderation |
| Notifications | NotificationTest | View, unread count, mark read |
| User Model | Unit/UserModelTest | Role helpers, relationships, password hashing |
| Announcement Model | Unit/AnnouncementModelTest | Scopes, computed attributes |
| Forum Models | Unit/ForumModelTest | Auto-slug, relationships, boolean casts |
| Enrollment Model | Unit/EnrollmentModelTest | Status label, average score, scopes |
| Settings Model | Unit/SystemSettingModelTest | Key-value CRUD |
| Middleware | Unit/EnsureUserRoleTest | Role matching, rejection |

---

## 9. Development Setup

### 9.1 Prerequisites
- **PHP** ≥ 8.2 with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- **Composer** ≥ 2.x
- **Node.js** ≥ 20.x with npm
- **MySQL** 8.x (production) or **SQLite** (development)

### 9.2 Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url> als_learninghub_tacloban
cd als_learninghub_tacloban

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Environment configuration
cp .env.example .env
php artisan key:generate

# 5. Database setup (SQLite for development)
touch database/database.sqlite
php artisan migrate

# 6. Seed sample data
php artisan db:seed

# 7. Generate Wayfinder routes
php artisan wayfinder:generate

# 8. Start development servers
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (frontend assets)
npm run dev
```

### 9.3 Default Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@alsconnect.ph | password |
| Teacher | teacher@alsconnect.ph | password |
| Student | student@alsconnect.ph | password |

### 9.4 Environment Variables

Key `.env` variables to configure:

```env
APP_NAME="ALS Connect Tacloban"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite           # or mysql for production
DB_DATABASE=/path/to/database.sqlite

MAIL_MAILER=smtp               # or log for development
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@alsconnect.ph
MAIL_FROM_NAME="ALS Connect Tacloban"

FILESYSTEM_DISK=public         # For file uploads
```

---

## 10. Production Deployment

### 10.1 Server Requirements
- PHP ≥ 8.2 with required extensions
- MySQL 8.x
- Nginx or Apache web server
- Composer
- Node.js (for build step only)
- SSL certificate (HTTPS)

### 10.2 Deployment Steps

```bash
# 1. Clone and install dependencies
git clone <repository-url> /var/www/alsconnect
cd /var/www/alsconnect
composer install --optimize-autoloader --no-dev
npm ci && npm run build

# 2. Configure environment
cp .env.example .env
# Edit .env with production values:
#   APP_ENV=production
#   APP_DEBUG=false
#   DB_CONNECTION=mysql
#   etc.
php artisan key:generate

# 3. Database
php artisan migrate --force
php artisan db:seed --force  # Only for initial deployment

# 4. Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan icons:cache

# 5. Storage link
php artisan storage:link

# 6. Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 10.3 Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name alsconnect.ph www.alsconnect.ph;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name alsconnect.ph www.alsconnect.ph;

    root /var/www/alsconnect/public;
    index index.php;

    ssl_certificate /etc/ssl/certs/alsconnect.pem;
    ssl_certificate_key /etc/ssl/private/alsconnect.key;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 20M;
}
```

### 10.4 Queue Worker (for notifications)

```bash
# Supervisor configuration: /etc/supervisor/conf.d/alsconnect-worker.conf
[program:alsconnect-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/alsconnect/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/alsconnect/storage/logs/worker.log
stopwaitsecs=3600
```

### 10.5 Scheduled Tasks

```bash
# Add to crontab (crontab -e)
* * * * * cd /var/www/alsconnect && php artisan schedule:run >> /dev/null 2>&1
```

---

## 11. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|---|---|---|
| 500 error on first load | Missing `.env` or app key | Run `cp .env.example .env && php artisan key:generate` |
| "Vite manifest not found" | Frontend not built | Run `npm run build` |
| File uploads fail | Storage not linked | Run `php artisan storage:link` |
| Permission denied | Wrong file ownership | Run `chown -R www-data:www-data storage bootstrap/cache` |
| Emails not sending | Mail config missing | Check `.env` mail settings; use `MAIL_MAILER=log` for testing |
| 2FA not working | Clock skew | Ensure server time is synchronized (NTP) |
| Migrations fail | Database not configured | Verify `DB_CONNECTION` and `DB_DATABASE` in `.env` |

### Useful Commands

```bash
# Clear all caches
php artisan optimize:clear

# Check route list
php artisan route:list

# Run migrations with rollback
php artisan migrate:fresh --seed

# Check application status
php artisan about

# Tail logs
php artisan pail
```
