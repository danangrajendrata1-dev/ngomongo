# TalkBridge AI Desktop

TalkBridge AI Desktop adalah aplikasi desktop Windows berbentuk `.exe` yang memungkinkan pengguna berbicara menggunakan bahasa Indonesia, lalu sistem menerjemahkan suara tersebut secara realtime menjadi bahasa Inggris dan mengirimkannya ke aplikasi lain seperti Discord, Zoom, Google Meet, Microsoft Teams, atau voice chat game melalui virtual microphone.

Produk ini dirancang sebagai **AI voice interpreter desktop** untuk membantu interview kerja internasional, meeting remote, kolaborasi dengan tim beda bahasa, komunikasi Discord/game, customer support, dan kebutuhan kerja lintas bahasa.

---

## 1. Core Idea

Alur utama produk:

```txt
User berbicara bahasa Indonesia
        ↓
TalkBridge menangkap suara dari microphone asli
        ↓
Speech-to-text mengubah suara menjadi teks Indonesia
        ↓
AI menerjemahkan teks Indonesia ke bahasa Inggris
        ↓
Text-to-speech membuat suara bahasa Inggris
        ↓
Output diarahkan ke virtual microphone
        ↓
Discord / Zoom / Meet menerima suara bahasa Inggris
```

Contoh penggunaan:

```txt
User bicara:
"Saya punya pengalaman membangun sistem ERP dan aplikasi BK sekolah."

Lawan bicara mendengar:
"I have experience building an ERP system and a school counseling application."
```

---

## 2. Product Goals

Tujuan utama:

1. Membantu pengguna Indonesia berkomunikasi secara verbal dalam bahasa Inggris tanpa harus langsung fasih berbicara Inggris.
2. Menyediakan aplikasi desktop yang bisa berjalan di background dan dipakai bersama Discord, Zoom, Google Meet, Microsoft Teams, atau aplikasi voice chat lain.
3. Mendukung mode terjemahan realtime dengan output suara bahasa Inggris.
4. Mendukung voice profile agar suara output dapat dibuat mirip suara pengguna sendiri dengan persetujuan eksplisit.
5. Menyediakan transcript, usage tracking, plan limit, dan sistem keamanan untuk audio serta voice profile.

---

## 3. Target Users

Target pengguna utama:

1. Job seeker Indonesia yang ingin interview dengan perusahaan luar negeri.
2. Freelancer yang bekerja dengan klien internasional.
3. Remote worker yang bekerja dengan tim global.
4. Gamer atau Discord user yang ingin berkomunikasi dengan komunitas global.
5. Pelajar atau mahasiswa yang ingin latihan komunikasi bahasa Inggris.
6. Customer support lokal yang melayani pelanggan asing.

---

## 4. Main Features

### 4.1 Desktop App

Fitur utama aplikasi desktop:

- Login dan register.
- Dashboard user.
- Voice Translate.
- Device Setup.
- Voice Profile.
- Transcript History.
- Usage & Plan.
- Settings.
- Floating widget saat translate aktif.
- Build installer `.exe`.

### 4.2 Voice Translate

Fitur inti:

- Pilih input microphone.
- Pilih output audio device.
- Pilih bahasa sumber dan target.
- Start / Pause / Stop voice translation.
- Push-to-talk mode.
- Realtime original transcript.
- Realtime translated transcript.
- Output suara Inggris ke virtual microphone.
- Latency indicator.
- AI status indicator.
- Connection status indicator.

### 4.3 Voice Profile

Fitur suara pengguna:

- Record voice sample.
- Upload voice sample.
- Consent recording.
- Generate voice profile melalui provider.
- Test voice profile.
- Set default voice profile.
- Disable/delete voice profile.

Catatan keamanan:

> Voice profile hanya boleh dibuat dari suara milik pengguna sendiri atau suara yang memiliki izin eksplisit.

### 4.4 Transcript History

- Simpan sesi percakapan.
- Simpan original transcript.
- Simpan translated transcript.
- Search transcript.
- Delete transcript.
- Export transcript ke TXT.
- Export PDF dapat ditambahkan pada fase lanjutan.

### 4.5 Usage & Plan

- Hitung durasi audio input.
- Hitung durasi audio output.
- Catat provider dan model AI.
- Hitung estimasi biaya.
- Batasi penggunaan berdasarkan plan.
- Tampilkan usage bulanan.

---

## 5. Translation Modes

Mode awal yang direncanakan:

| Mode | Tujuan |
|---|---|
| Interview Mode | Bahasa dibuat formal, profesional, dan cocok untuk interview kerja |
| Meeting Mode | Bahasa jelas, ringkas, dan cocok untuk diskusi kerja |
| Discord Mode | Bahasa lebih santai dan natural |
| Game Mode | Terjemahan dibuat pendek, cepat, dan mengutamakan latency rendah |
| Casual Mode | Untuk percakapan umum sehari-hari |

---

## 6. Technology Stack

### Desktop

```txt
Electron
React
TypeScript
Vite
electron-builder
```

### Backend

```txt
FastAPI
SQLAlchemy
Alembic
PostgreSQL
WebSocket
Redis optional
```

### Admin Web

```txt
Next.js
TypeScript
Tailwind CSS
```

### AI Providers

```txt
Speech-to-text provider
Translation provider
Text-to-speech provider
Voice cloning provider
```

Provider dapat diganti melalui abstraction layer di folder `providers`.

### Audio Routing

Untuk fase awal:

```txt
VB-CABLE / Virtual Audio Cable
```

Untuk fase profesional:

```txt
TalkBridge Virtual Microphone Driver
```

---

## 7. System Architecture

Arsitektur high-level:

```txt
Desktop App
   ├── Capture microphone
   ├── Show realtime transcript
   ├── Receive translated audio
   └── Output to virtual audio device

Backend API
   ├── Auth
   ├── Device settings
   ├── Realtime WebSocket
   ├── STT / Translation / TTS orchestration
   ├── Voice profile management
   ├── Transcript storage
   └── Usage tracking

PostgreSQL
   ├── users
   ├── desktop_devices
   ├── device_settings
   ├── translation_sessions
   ├── transcripts
   ├── usage_logs
   ├── voice_profiles
   ├── plans
   ├── subscriptions
   └── audit_logs
```

---

## 8. Audio Flow

### 8.1 Normal Flow

```txt
Microphone asli
   ↓
Desktop app audio capture
   ↓
WebSocket audio stream ke backend
   ↓
Speech-to-text
   ↓
Translation
   ↓
Text-to-speech
   ↓
Translated audio balik ke desktop
   ↓
Desktop output ke virtual audio device
   ↓
Discord / Zoom / Meet menerima audio sebagai microphone
```

### 8.2 Discord Setup

Contoh setup awal memakai VB-CABLE:

```txt
TalkBridge Output Device  : CABLE Input
Discord Input Device      : CABLE Output
User Real Microphone      : Digunakan hanya oleh TalkBridge
```

---

## 9. Latency, Buffering, and Echo Control

Target latency ideal:

```txt
1–3 detik untuk kalimat pendek
```

Strategi teknis:

1. Menggunakan streaming audio chunk.
2. Menggunakan voice activity detection.
3. Menggunakan sentence chunking.
4. Menggunakan partial transcript.
5. Menggunakan buffering kecil dan stabil.
6. Menghindari pemrosesan blocking di UI.
7. Menyediakan indikator latency di UI.

Echo prevention:

1. Discord/Zoom/Meet harus memilih virtual microphone sebagai input.
2. Microphone asli hanya digunakan oleh TalkBridge.
3. TalkBridge perlu mendukung echo cancellation.
4. TalkBridge perlu mendukung noise suppression.
5. Push-to-talk dan pause harus tersedia agar pengguna bisa bicara offline tanpa terkirim ke virtual mic.

---

## 10. Project Structure

Struktur utama project:

```txt
talkbridge-ai/
│
├── apps/
│   ├── desktop/
│   ├── api/
│   └── admin-web/
│
├── packages/
│   ├── shared-types/
│   └── shared-config/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── diagrams/
│
├── docs/
│   ├── PRD.md
│   ├── technical.md
│   ├── database.md
│   ├── security.md
│   └── AGENTS.md
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.admin-web
│   └── docker-compose.yml
│
├── scripts/
│   ├── dev-api.sh
│   ├── dev-desktop.sh
│   ├── build-desktop.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── storage/
│   ├── voice-samples/
│   ├── consent-recordings/
│   ├── transcripts/
│   └── temp-audio/
│
├── .gitignore
├── README.md
└── package.json
```

---

## 11. Detailed App Structure

### 11.1 Desktop App

```txt
apps/desktop/
│
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── windows/
│   ├── ipc/
│   └── tray/
│
├── renderer/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── lib/
│   ├── index.html
│   └── vite.config.ts
│
├── native/
├── resources/
├── package.json
├── electron-builder.yml
└── .env.example
```

### 11.2 Backend API

```txt
apps/api/
│
├── main.py
├── core/
├── models/
├── schemas/
├── routes/
├── services/
├── providers/
├── repositories/
├── workers/
├── migrations/
├── tests/
├── requirements.txt
├── alembic.ini
└── .env.example
```

### 11.3 Admin Web

```txt
apps/admin-web/
│
├── app/
├── components/
├── services/
├── types/
├── package.json
└── .env.example
```

---

## 12. Database Overview

Tabel utama:

```txt
users
desktop_devices
device_settings
translation_sessions
transcripts
usage_logs
voice_profiles
plans
subscriptions
audit_logs
```

Relasi sederhana:

```txt
users
  ├── desktop_devices
  ├── device_settings
  ├── translation_sessions
  │       ├── transcripts
  │       └── usage_logs
  ├── voice_profiles
  └── subscriptions
```

Database detail ditulis di:

```txt
docs/database.md
```

---

## 13. API Overview

Endpoint utama:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout

POST /desktop/register-device
GET  /desktop/settings
PATCH /desktop/settings

POST /realtime/session/start
WS   /realtime/voice
POST /realtime/session/stop

GET    /transcripts
GET    /transcripts/{id}
DELETE /transcripts/{id}

POST   /voice-profiles
GET    /voice-profiles
POST   /voice-profiles/{id}/test
PATCH  /voice-profiles/{id}/set-default
DELETE /voice-profiles/{id}

GET /usage/me
GET /usage/monthly

GET  /plans
GET  /subscriptions/me
POST /subscriptions/change-plan
```

API detail ditulis di:

```txt
docs/technical.md
```

---

## 14. Environment Variables

### 14.1 Backend `.env`

```env
APP_NAME=TalkBridge AI
APP_ENV=development
APP_DEBUG=true

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/talkbridge_ai

JWT_SECRET_KEY=change_this_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

OPENAI_API_KEY=
OPENAI_STT_MODEL=
OPENAI_TRANSLATION_MODEL=
OPENAI_TTS_MODEL=

ELEVENLABS_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=

REDIS_URL=redis://localhost:6379/0

STORAGE_DRIVER=local
STORAGE_PATH=./storage

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 14.2 Desktop `.env`

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=TalkBridge AI
```

### 14.3 Admin Web `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TalkBridge Admin
```

---

## 15. Local Development Setup

### 15.1 Prerequisites

Install:

```txt
Node.js
Python
PostgreSQL
Git
VSCode
VB-CABLE
```

Optional:

```txt
Redis
Docker
Postman/Insomnia
```

### 15.2 Clone Repository

```bash
git clone <repository-url>
cd talkbridge-ai
```

### 15.3 Setup Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Windows PowerShell:

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Run migration:

```bash
alembic upgrade head
```

Run backend:

```bash
uvicorn main:app --reload
```

### 15.4 Setup Desktop App

```bash
cd apps/desktop
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
cd apps/desktop
npm install
copy .env.example .env
npm run dev
```

### 15.5 Setup Admin Web

```bash
cd apps/admin-web
npm install
cp .env.example .env
npm run dev
```

---

## 16. Build Desktop Installer

Build `.exe` installer:

```bash
cd apps/desktop
npm run build
npm run dist
```

Output installer biasanya berada di:

```txt
apps/desktop/dist/
```

---

## 17. Development Phases

### Phase 1 — Foundation Desktop

Target:

```txt
Aplikasi .exe bisa dibuka dan user bisa memilih mic/output.
```

Tasks:

1. Setup Electron + React + TypeScript.
2. Buat layout desktop.
3. Buat DashboardPage.
4. Buat VoiceTranslatePage.
5. Detect microphone.
6. Detect output device.
7. Simpan setting lokal.

### Phase 2 — Backend + Database

Target:

```txt
User bisa login dari desktop app.
```

Tasks:

1. Setup FastAPI.
2. Setup PostgreSQL.
3. Setup SQLAlchemy.
4. Setup Alembic.
5. Buat auth register/login.
6. Buat tabel user dan device.
7. Hubungkan desktop app ke backend.

### Phase 3 — Realtime Audio

Target:

```txt
Audio dari desktop berhasil masuk ke backend.
```

Tasks:

1. Capture audio dari mic.
2. Kirim audio chunk ke backend.
3. Backend menerima audio stream.
4. Tampilkan audio level dan status.

### Phase 4 — Translation Pipeline

Target:

```txt
User bicara Indonesia, aplikasi menghasilkan suara English.
```

Tasks:

1. Speech-to-text Indonesia.
2. Translate ke English.
3. Text-to-speech English.
4. Kirim audio English ke desktop.

### Phase 5 — Discord Output

Target:

```txt
Orang lain di Discord mendengar suara English.
```

Tasks:

1. Setup VB-CABLE.
2. Aplikasi output suara ke CABLE Input.
3. Discord input pilih CABLE Output.
4. Test Discord call.

### Phase 6 — Voice Profile

Target:

```txt
Suara English terdengar mirip suara user.
```

Tasks:

1. Record voice sample.
2. Record consent.
3. Generate voice profile.
4. Simpan voice_id.
5. Pakai voice profile untuk TTS.

### Phase 7 — Productization

Target:

```txt
Produk siap diuji oleh user beta.
```

Tasks:

1. Transcript history.
2. Usage tracking.
3. Plan limit.
4. Floating widget.
5. Installer `.exe`.
6. Error handling.
7. Basic admin web.

---

## 18. Security Principles

Prinsip keamanan utama:

1. Password harus di-hash.
2. Token tidak boleh disimpan sembarangan.
3. API harus protected.
4. User hanya bisa mengakses data miliknya sendiri.
5. Voice sample harus private.
6. Consent recording wajib untuk voice profile.
7. Transcript harus private.
8. Admin action harus masuk audit log.
9. Tidak boleh membuat voice profile dari suara orang lain tanpa izin.
10. File audio sensitif harus bisa dihapus oleh user.

Security detail ditulis di:

```txt
docs/security.md
```

---

## 19. AI and Voice Safety

Aturan wajib:

1. Voice profile hanya untuk suara sendiri atau suara yang memiliki izin eksplisit.
2. User wajib memberikan consent sebelum voice profile dibuat.
3. Consent recording harus disimpan.
4. Audit log harus mencatat pembuatan, update, dan penghapusan voice profile.
5. Admin dapat menonaktifkan voice profile bermasalah.
6. Aplikasi harus memberi informasi bahwa output suara diproses oleh AI.
7. Aplikasi tidak boleh digunakan untuk impersonation, penipuan, atau penyamaran identitas tanpa izin.

---

## 20. Error Handling

Aplikasi harus menangani kondisi berikut:

| Kondisi | Respon UI |
|---|---|
| Internet putus | Tampilkan status merah dan hentikan session dengan aman |
| AI provider error | Tampilkan pesan jelas dan opsi retry |
| Microphone tidak ditemukan | Disable tombol Start dan arahkan user ke Device Setup |
| Output device tidak ditemukan | Tampilkan warning dan minta user pilih ulang |
| Kuota habis | Tampilkan pesan limit usage |
| Voice profile gagal dibuat | Tampilkan status failed dan alasan umum |
| Latency terlalu tinggi | Tampilkan indikator kuning/merah |

Graceful degradation:

1. Jika voice profile gagal, fallback ke default TTS voice.
2. Jika TTS gagal, tetap tampilkan translated text.
3. Jika STT gagal, hentikan session dan tampilkan error.
4. Jika provider utama down, fallback provider dapat ditambahkan pada fase lanjutan.

---

## 21. Testing Strategy

### Backend Tests

```txt
test_auth.py
test_devices.py
test_translation.py
test_voice_profile.py
test_usage.py
test_transcripts.py
```

### Desktop Tests

Area yang harus diuji:

1. Login flow.
2. Device detection.
3. Audio level meter.
4. Start/pause/stop session.
5. WebSocket connection.
6. Output device selection.
7. Floating widget behavior.
8. Error state display.

### Manual Integration Tests

Wajib diuji manual:

1. TalkBridge output ke VB-CABLE.
2. Discord input dari VB-CABLE.
3. Zoom input dari VB-CABLE.
4. Google Meet input dari VB-CABLE.
5. Latency pada koneksi internet berbeda.
6. Noise dan echo pada beberapa microphone.

---

## 22. Deployment Plan

### Backend

Opsi:

```txt
Google Cloud Run
Railway
Render
VPS
```

### Database

Opsi:

```txt
Neon PostgreSQL
Supabase PostgreSQL
Managed PostgreSQL
Local PostgreSQL untuk development
```

### Admin Web

Opsi:

```txt
Vercel
Cloudflare Pages
Netlify
```

### Desktop App Distribution

Opsi:

```txt
Manual installer download
GitHub Releases
Auto-update pada fase lanjutan
```

---

## 23. Documentation

Dokumen utama project:

```txt
docs/PRD.md
docs/technical.md
docs/database.md
docs/security.md
docs/AGENTS.md
README.md
```

Fungsi dokumen:

| File | Fungsi |
|---|---|
| PRD.md | Menjelaskan produk, scope, fitur, user flow, acceptance criteria |
| technical.md | Menjelaskan arsitektur teknis, API, services, realtime flow |
| database.md | Menjelaskan schema database dan relasi |
| security.md | Menjelaskan aturan keamanan, privacy, voice safety |
| AGENTS.md | Instruksi kerja untuk Codex/AI agent agar implementasi terkendali |
| README.md | Panduan utama project dari awal sampai development |

---

## 24. Development Rules

Aturan development:

1. Jangan melakukan refactor besar tanpa rencana.
2. Jangan mengubah schema database tanpa migration dan dokumentasi.
3. Jangan hardcode API key, database URL, atau secret.
4. Gunakan environment variables.
5. Gunakan service/repository pattern di backend.
6. Gunakan komponen kecil dan reusable di desktop renderer.
7. Pisahkan Electron main process dan renderer process.
8. Semua endpoint sensitif harus protected.
9. Semua file audio sensitif harus private.
10. Update dokumentasi jika ada perubahan fitur besar.
11. Ikuti `docs/AGENTS.md` sebelum meminta bantuan Codex/AI agent.

---

## 25. Current Status

Status awal project:

```txt
Planning and documentation phase
```

Dokumen yang sudah disiapkan:

```txt
PRD.md
technical.md
database.md
security.md
AGENTS.md
README.md
```

Tahap berikutnya:

```txt
1. Final review dokumen.
2. Buat repository.
3. Setup struktur folder.
4. Setup Electron desktop app.
5. Setup FastAPI backend.
6. Setup PostgreSQL dan migration awal.
```

---

## 26. License

Belum ditentukan.

Untuk private project, repository dapat dibuat private terlebih dahulu.

---

## 27. Project Vision

TalkBridge AI Desktop bukan sekadar translator biasa.

Produk ini adalah:

```txt
AI Voice Translator
+ Desktop App
+ Virtual Microphone
+ Custom Voice Profile
+ Transcript & Usage System
```

Visi produk:

> Membantu orang Indonesia berbicara dengan dunia global menggunakan bahasa Indonesia, sementara lawan bicara mendengar bahasa Inggris yang natural, profesional, dan mudah dipahami.
