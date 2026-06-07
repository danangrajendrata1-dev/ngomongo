# TECHNICAL.md — TalkBridge AI Desktop

## 1. Ringkasan Teknis

**TalkBridge AI Desktop** adalah aplikasi desktop Windows `.exe` yang menerjemahkan suara pengguna dari bahasa Indonesia ke bahasa Inggris secara realtime dan mengirimkan output suara ke virtual microphone agar dapat digunakan di Discord, Zoom, Google Meet, Microsoft Teams, OBS, atau voice chat game.

Target alur utama:

```txt
Real Microphone
   ↓
Desktop App Audio Capture
   ↓
Realtime Audio Streaming
   ↓
Speech-to-Text
   ↓
Translation
   ↓
Text-to-Speech / Custom Voice
   ↓
Virtual Audio Output
   ↓
Discord / Zoom / Meet Input Device
```

---

## 2. Tujuan Technical Design

Dokumen ini bertujuan menjadi dasar implementasi teknis agar project tidak berkembang secara acak.

Tujuan:

1. Menjelaskan arsitektur aplikasi.
2. Menentukan stack teknologi.
3. Menentukan struktur project.
4. Menentukan flow realtime audio.
5. Menentukan API contract dasar.
6. Menentukan strategi latency, buffering, echo cancellation, dan fallback.
7. Menentukan tahapan implementasi profesional.

---

## 3. Tech Stack

### 3.1 Desktop App

```txt
Electron
React
TypeScript
Vite
electron-builder
Zustand atau Redux ringan
Native WebSocket
```

Fungsi:

1. UI aplikasi `.exe`.
2. Device selection.
3. Mic capture.
4. Audio level meter.
5. WebSocket client.
6. Audio playback ke selected output device.
7. Floating widget.
8. Local secure settings.

### 3.2 Backend API

```txt
FastAPI
SQLAlchemy
Alembic
PostgreSQL
WebSocket
Pydantic
JWT Auth
Redis optional
```

Fungsi:

1. Auth.
2. Device registration.
3. Settings sync.
4. Realtime session management.
5. Provider integration.
6. Transcript storage.
7. Usage calculation.
8. Voice profile management.
9. Admin API.

### 3.3 Database

```txt
PostgreSQL
```

### 3.4 AI Providers

Provider awal dibuat modular:

```txt
STT Provider
Translation Provider
TTS Provider
Voice Cloning Provider
```

Implementasi provider awal dapat memakai:

1. OpenAI untuk realtime/STT/translation/TTS.
2. ElevenLabs atau Azure untuk voice profile/custom voice.
3. Provider lain di masa depan melalui interface.

### 3.5 Audio Routing

Versi awal:

```txt
VB-CABLE / Virtual Audio Cable eksternal
```

Versi profesional:

```txt
TalkBridge Virtual Microphone Driver
```

---

## 4. Arsitektur High Level

```txt
┌────────────────────────────┐
│ Windows Desktop App         │
│ Electron + React            │
│                            │
│ - Mic Capture               │
│ - Device Setup              │
│ - Floating Widget           │
│ - WebSocket Client          │
│ - Audio Output              │
└─────────────┬──────────────┘
              │ HTTPS / WebSocket
              ▼
┌────────────────────────────┐
│ FastAPI Backend             │
│                            │
│ - Auth                      │
│ - Session Manager           │
│ - Realtime Audio Pipeline   │
│ - Provider Orchestrator     │
│ - Usage Tracker             │
│ - Transcript Service        │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ PostgreSQL                  │
│                            │
│ users, devices, sessions,   │
│ transcripts, usage, voice   │
│ profiles, subscriptions     │
└────────────────────────────┘
              │
              ▼
┌────────────────────────────┐
│ AI Providers                │
│ STT / Translate / TTS /     │
│ Voice Cloning               │
└────────────────────────────┘
```

---

## 5. Struktur Project

```txt
talkbridge-ai/
│
├── apps/
│   ├── desktop/
│   │   ├── electron/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   ├── ipc/
│   │   │   ├── tray/
│   │   │   └── windows/
│   │   ├── renderer/
│   │   │   ├── src/
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── stores/
│   │   │   │   ├── types/
│   │   │   │   └── lib/
│   │   ├── native/
│   │   ├── resources/
│   │   ├── package.json
│   │   └── electron-builder.yml
│   │
│   ├── api/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── providers/
│   │   ├── repositories/
│   │   ├── workers/
│   │   ├── migrations/
│   │   └── tests/
│   │
│   └── admin-web/
│
├── packages/
│   ├── shared-types/
│   └── shared-config/
│
├── docs/
├── database/
├── docker/
├── scripts/
├── storage/
├── README.md
└── package.json
```

---

## 6. Desktop App Design

### 6.1 Main Process

File utama:

```txt
apps/desktop/electron/main.ts
```

Tugas:

1. Membuat main window.
2. Membuat floating widget window.
3. Mengatur tray icon.
4. Mengatur app lifecycle.
5. Mengatur IPC channel.
6. Mengatur auto update nanti.

### 6.2 Preload

File:

```txt
apps/desktop/electron/preload.ts
```

Tugas:

1. Expose API aman ke renderer.
2. Tidak expose Node.js penuh.
3. Validasi IPC call.

Security default:

```txt
contextIsolation: true
nodeIntegration: false
```

### 6.3 Renderer

Halaman utama:

```txt
LoginPage
RegisterPage
DashboardPage
VoiceTranslatePage
VoiceProfilePage
DeviceSetupPage
HistoryPage
UsagePage
SettingsPage
```

### 6.4 Audio Hooks

Hooks penting:

```txt
useAudioDevices
useRealtimeTranslator
useVoiceProfile
useSettings
```

`useAudioDevices`:

1. Ambil daftar mic.
2. Ambil daftar output device.
3. Test mic level.
4. Test output sound.

`useRealtimeTranslator`:

1. Start session.
2. Buka WebSocket.
3. Capture mic.
4. Kirim audio chunk.
5. Terima transcript/translation/audio.
6. Output audio ke selected device.
7. Stop/pause/mute session.

---

## 7. Backend Design

### 7.1 Layering

Backend mengikuti pola:

```txt
routes → services → repositories → models/database
```

Aturan:

1. Route hanya menangani HTTP/WebSocket input-output.
2. Business logic ada di service.
3. Query database ada di repository.
4. Provider external dibungkus di `providers/`.
5. Schema validation memakai Pydantic.

### 7.2 Core Modules

```txt
core/config.py
core/database.py
core/security.py
core/websocket_manager.py
core/exceptions.py
core/logger.py
```

### 7.3 Services

```txt
auth_service.py
user_service.py
desktop_device_service.py
device_setting_service.py
realtime_translate_service.py
speech_to_text_service.py
translation_service.py
text_to_speech_service.py
transcript_service.py
voice_profile_service.py
usage_service.py
subscription_service.py
```

### 7.4 Providers

Provider harus mengikuti interface.

```python
class SpeechToTextProvider:
    async def transcribe(self, audio_chunk: bytes, language: str) -> str:
        raise NotImplementedError

class TranslationProvider:
    async def translate(self, text: str, source: str, target: str, mode: str) -> str:
        raise NotImplementedError

class TextToSpeechProvider:
    async def synthesize(self, text: str, voice_id: str | None) -> bytes:
        raise NotImplementedError
```

Tujuan:

1. Provider bisa diganti tanpa mengubah business logic.
2. Bisa fallback ke provider lain.
3. Bisa menghitung biaya per provider.

---

## 8. Realtime Audio Flow

### 8.1 Start Session

```txt
Desktop App
   ↓ POST /realtime/session/start
Backend cek auth, plan, usage, device
   ↓
Backend create translation_session
   ↓
Backend return session_id dan websocket_url
```

### 8.2 WebSocket Audio Stream

Desktop mengirim:

```json
{
  "type": "audio_chunk",
  "session_id": "uuid",
  "sequence_number": 1,
  "audio_format": "pcm16",
  "sample_rate": 16000,
  "audio_base64": "..."
}
```

Backend mengirim partial transcript:

```json
{
  "type": "transcript_partial",
  "session_id": "uuid",
  "original_text": "Saya ingin...",
  "is_final": false
}
```

Backend mengirim final translation:

```json
{
  "type": "translation_final",
  "session_id": "uuid",
  "original_text": "Saya ingin menjelaskan pengalaman saya.",
  "translated_text": "I would like to explain my experience.",
  "is_final": true
}
```

Backend mengirim audio output:

```json
{
  "type": "translated_audio",
  "session_id": "uuid",
  "audio_format": "pcm16",
  "sample_rate": 24000,
  "audio_base64": "..."
}
```

### 8.3 Stop Session

```txt
Desktop App
   ↓ POST /realtime/session/stop
Backend finalize duration
Backend save transcript final
Backend save usage log
Backend set status completed/stopped
```

---

## 9. Audio Format Strategy

Target awal:

```txt
Input audio: PCM16 mono 16kHz atau 24kHz
Output audio: PCM16/WAV compatible 24kHz
Transport: base64 over WebSocket untuk awal
```

Catatan:

1. Base64 WebSocket lebih mudah untuk implementasi awal.
2. Untuk optimasi latency, dapat pindah ke binary WebSocket frame.
3. Untuk audio realtime yang lebih kompleks, pertimbangkan WebRTC/native audio pipeline.

---

## 10. Latency & Buffering Strategy

Target latency:

```txt
Ideal: 1–3 detik untuk kalimat pendek
Acceptable beta: 2–5 detik
```

Komponen latency:

1. Mic capture buffer.
2. Audio upload WebSocket.
3. STT processing.
4. Translation processing.
5. TTS generation.
6. Audio playback buffer.

Strategi:

1. Gunakan chunk audio kecil.
2. Gunakan Voice Activity Detection.
3. Proses partial transcript.
4. Jangan tunggu paragraf panjang.
5. Pakai sentence chunking.
6. Untuk Game Mode, prioritaskan kalimat pendek.
7. Untuk Interview Mode, boleh sedikit lebih lambat demi kualitas bahasa.
8. Gunakan output buffer agar audio tidak patah.
9. Tampilkan latency indicator di UI.

Mode latency:

| Mode | Prioritas |
|---|---|
| Game | Latency rendah, kalimat pendek |
| Discord | Natural dan cukup cepat |
| Meeting | Jelas dan stabil |
| Interview | Formal, profesional, kualitas lebih penting |
| Casual | Natural dan santai |

---

## 11. Echo Cancellation & Feedback Prevention

Risiko utama:

Suara lawan bicara atau output AI tertangkap microphone asli dan diproses ulang, sehingga terjadi echo atau feedback loop.

Requirement teknis:

1. Aktifkan echo cancellation jika API audio mendukung.
2. Aktifkan noise suppression.
3. Sediakan Push-to-Talk.
4. Sediakan Pause dan Mute instan.
5. Jangan proses audio saat pause/mute.
6. Deteksi jika input dan output device sama/berisiko.
7. Tambahkan setup checklist untuk Discord/Zoom.

UI indicator:

```txt
Green  = ready/active
Yellow = processing/reconnecting/high latency
Red    = error/provider down/device missing
Gray   = paused/muted
```

---

## 12. Virtual Microphone Strategy

### 12.1 Phase Awal

Gunakan VB-CABLE/Virtual Audio Cable eksternal.

Flow:

```txt
TalkBridge output English voice
   ↓
CABLE Input
   ↓
CABLE Output
   ↓
Discord Input Device
```

### 12.2 Phase Profesional

Bangun custom virtual microphone driver:

```txt
TalkBridge Virtual Microphone
```

Catatan:

1. Driver audio Windows adalah pekerjaan kompleks.
2. Butuh signing dan testing serius.
3. Jangan dikerjakan sebelum core product stabil.

---

## 13. Voice Profile Flow

```txt
User membuka Voice Profile
   ↓
User membaca consent statement
   ↓
User merekam sample suara
   ↓
Desktop upload sample ke backend
   ↓
Backend validasi file
   ↓
Backend kirim ke voice provider
   ↓
Provider mengembalikan voice_id
   ↓
Backend simpan voice profile
   ↓
User test voice
   ↓
User set as default
```

Safety:

1. Consent wajib.
2. Hanya suara milik user sendiri.
3. Audit log wajib.
4. User bisa delete/disable voice profile.

---

## 14. API Contract

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
```

### Desktop

```txt
POST /desktop/register-device
GET  /desktop/settings
PATCH /desktop/settings
```

### Realtime

```txt
POST /realtime/session/start
WS   /realtime/voice/{session_id}
POST /realtime/session/stop
POST /realtime/session/pause
POST /realtime/session/resume
```

### Voice Profiles

```txt
POST   /voice-profiles
GET    /voice-profiles
GET    /voice-profiles/{id}
POST   /voice-profiles/{id}/test
PATCH  /voice-profiles/{id}/set-default
DELETE /voice-profiles/{id}
```

### Transcripts

```txt
GET    /transcripts
GET    /transcripts/{id}
DELETE /transcripts/{id}
POST   /transcripts/export
```

### Usage

```txt
GET /usage/me
GET /usage/monthly
```

### Subscription

```txt
GET  /plans
GET  /subscriptions/me
POST /subscriptions/change-plan
```

### Admin

```txt
GET   /admin/users
GET   /admin/usage
GET   /admin/voice-profiles
PATCH /admin/users/{id}/status
```

---

## 15. Error Handling Strategy

### Error Types

```txt
AUTH_ERROR
DEVICE_NOT_FOUND
OUTPUT_DEVICE_NOT_FOUND
PROVIDER_STT_ERROR
PROVIDER_TRANSLATION_ERROR
PROVIDER_TTS_ERROR
PROVIDER_VOICE_ERROR
NETWORK_ERROR
USAGE_LIMIT_REACHED
SUBSCRIPTION_REQUIRED
INVALID_AUDIO_FORMAT
SESSION_NOT_FOUND
```

### Graceful Degradation

| Kondisi | Fallback |
|---|---|
| STT error | Stop session dan tampilkan error |
| Translation error | Tampilkan original transcript jika tersedia |
| TTS error | Fallback ke text-only mode |
| Voice profile error | Fallback ke standard voice jika user mengizinkan |
| Network lost | Pause session dan retry terbatas |
| Output device missing | Stop output dan arahkan ke Device Setup |
| Usage limit reached | Stop session dan tampilkan upgrade/limit info |

---

## 16. Usage Calculation

Usage harus dihitung di backend.

Komponen usage:

1. Audio input seconds.
2. Audio output seconds.
3. Text input tokens.
4. Text output tokens.
5. STT cost.
6. Translation cost.
7. TTS cost.
8. Voice profile/custom voice cost.

Formula konseptual:

```txt
estimated_total_cost = estimated_stt_cost
                     + estimated_translation_cost
                     + estimated_tts_cost
                     + estimated_voice_profile_cost
```

Plan limit harus dicek:

1. Sebelum session start.
2. Selama session aktif.
3. Saat session selesai.

---

## 17. Admin Web

Admin web tidak dikerjakan di fase pertama, tapi struktur disiapkan.

Fitur admin:

1. Login admin.
2. List user.
3. View usage.
4. View subscription.
5. Suspend user.
6. View voice profile status.
7. View provider error summary.

---

## 18. Deployment Design

### Development Local

```txt
Desktop app: local Electron
Backend: localhost FastAPI
Database: local PostgreSQL
Storage: local folder
Redis: optional local
```

### Beta Deployment

```txt
Desktop app: .exe installer
Backend: Google Cloud Run / Railway / VPS
Database: Neon / Supabase PostgreSQL / managed PostgreSQL
Storage: Cloudflare R2 / S3 compatible
Redis: Upstash / managed Redis optional
```

### Production Deployment

```txt
Desktop app: signed installer + auto update
Backend: scalable container service
Database: managed PostgreSQL with backup
Storage: private bucket
Monitoring: error and usage monitoring
```

---

## 19. Environment Variables

### Backend

```env
APP_NAME=TalkBridge AI
APP_ENV=development
APP_DEBUG=true
DATABASE_URL=postgresql://user:password@localhost:5432/talkbridge
JWT_SECRET_KEY=change_this_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
AZURE_SPEECH_KEY=
REDIS_URL=redis://localhost:6379/0
STORAGE_DRIVER=local
STORAGE_PATH=./storage
CORS_ORIGINS=http://localhost:5173
```

### Desktop

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=TalkBridge AI
```

Catatan:

1. Desktop app tidak boleh menyimpan provider API key.
2. `.env` tidak boleh masuk git.

---

## 20. Implementation Phases

### Phase 1 — Desktop Foundation

1. Setup Electron + React + TypeScript.
2. Buat layout desktop.
3. Buat DashboardPage.
4. Buat VoiceTranslatePage.
5. Detect microphone.
6. Detect output device.
7. Simpan setting lokal.

Output:

```txt
Aplikasi .exe bisa dibuka dan user bisa memilih mic/output.
```

### Phase 2 — Backend + Database

1. Setup FastAPI.
2. Setup PostgreSQL.
3. Setup SQLAlchemy.
4. Setup Alembic.
5. Buat auth register/login.
6. Buat tabel users, devices, settings.
7. Hubungkan desktop app ke backend.

Output:

```txt
User bisa login dari desktop app.
```

### Phase 3 — Realtime Audio Base

1. Capture mic.
2. Tampilkan audio level.
3. Kirim chunk ke backend.
4. Backend menerima audio WebSocket.
5. Backend mengembalikan dummy transcript.

Output:

```txt
Realtime audio path desktop → backend terbukti jalan.
```

### Phase 4 — Translation Pipeline

1. STT Indonesia.
2. Translate Indonesia → English.
3. TTS English standard voice.
4. Kirim audio English ke desktop.

Output:

```txt
User bicara Indonesia, app menghasilkan suara English.
```

### Phase 5 — Virtual Audio Output

1. Setup VB-CABLE.
2. Output audio English ke selected output device.
3. Test Discord input.
4. Buat checklist setup audio.

Output:

```txt
Discord menerima suara English.
```

### Phase 6 — Voice Profile

1. Record consent.
2. Upload voice sample.
3. Generate voice profile.
4. Simpan voice_id.
5. TTS memakai voice profile.

Output:

```txt
Hasil English voice terdengar mirip suara user.
```

### Phase 7 — Productization

1. Transcript history.
2. Usage tracking.
3. Subscription/plan limit.
4. Floating widget.
5. Installer `.exe`.
6. Error handling matang.
7. Admin web basic.

Output:

```txt
Beta product siap diuji user terbatas.
```

---

## 21. Testing Strategy

### Unit Test

1. Auth service.
2. Usage calculation.
3. Subscription limit.
4. Provider interface.
5. Transcript service.

### Integration Test

1. Login desktop → backend.
2. Start session.
3. WebSocket connect.
4. Save transcript.
5. Save usage.

### Manual Audio Test

1. Mic detection.
2. Output device detection.
3. VB-CABLE routing.
4. Discord input check.
5. Zoom/Meet check.
6. Echo cancellation check.
7. Pause/mute/PTT check.

### Latency Test

Measure:

1. Mic capture → backend receive.
2. Backend receive → transcript.
3. Transcript → translation.
4. Translation → TTS.
5. TTS → desktop playback.
6. Total end-to-end latency.

---

## 22. Technical Risks

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Latency tinggi | Percakapan terasa patah | Chunking, VAD, partial transcript, mode latency |
| Echo/feedback | Audio berulang | AEC, noise suppression, PTT, warning device |
| Provider down | Interview terganggu | Graceful degradation, fallback text-only |
| API cost tinggi | Bisnis rugi | Usage tracking detail, fair use, plan limit |
| Voice cloning abuse | Risiko etika/legal | Consent, audit log, disable policy |
| Virtual audio sulit | User gagal setup | Setup wizard, checklist, VB-CABLE guide |
| Desktop token bocor | Akun disalahgunakan | Secure storage, token expiry, logout |

---

## 23. Clean Code Rules

1. Gunakan nama file dan function yang jelas.
2. Jangan gabungkan logic UI, API, dan audio processing dalam satu file besar.
3. Route backend harus tipis.
4. Service berisi business logic.
5. Repository berisi query database.
6. Provider external harus melalui interface.
7. Error handling harus eksplisit.
8. Jangan hardcode URL/API key.
9. Buat type/schema untuk request/response.
10. Tambahkan test untuk logic penting.

---

## 24. Definition of Done

Fitur dianggap selesai jika:

1. UI tersedia dan bisa digunakan.
2. Backend endpoint tersedia jika dibutuhkan.
3. Validasi input tersedia.
4. Error state ditangani.
5. Data tersimpan dengan benar.
6. Authorization dicek di backend.
7. Tidak ada secret hardcoded.
8. Dokumentasi terkait diperbarui.
9. Basic manual test berhasil.
10. Tidak merusak flow yang sudah ada.
