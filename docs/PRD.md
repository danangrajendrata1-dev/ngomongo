# PRD — TalkBridge AI Desktop

## 1. Ringkasan Produk

**TalkBridge AI Desktop** adalah aplikasi desktop Windows berbentuk `.exe` yang memungkinkan pengguna berbicara menggunakan bahasa Indonesia, lalu aplikasi menerjemahkan suara tersebut secara realtime menjadi bahasa Inggris dan mengirimkannya ke aplikasi lain seperti Discord, Zoom, Google Meet, Microsoft Teams, atau voice chat game melalui virtual microphone.

Produk ini ditujukan untuk membantu pengguna Indonesia yang ingin melakukan interview kerja, meeting internasional, kolaborasi remote, customer service, atau komunikasi lintas bahasa tanpa harus langsung fasih berbicara bahasa Inggris.

Konsep utama:

```txt
User berbicara bahasa Indonesia
        ↓
Aplikasi menangkap suara dari microphone asli
        ↓
AI mengubah suara menjadi teks
        ↓
AI menerjemahkan ke bahasa Inggris
        ↓
AI menghasilkan suara bahasa Inggris
        ↓
Suara dikirim ke virtual microphone
        ↓
Discord/Zoom/Meet menerima suara bahasa Inggris
```

---

## 2. Tujuan Produk

Tujuan utama produk ini adalah membuat pengguna bisa berkomunikasi secara verbal dengan orang asing menggunakan bahasa Inggris, walaupun pengguna tetap berbicara dalam bahasa Indonesia.

### 2.1 Tujuan Bisnis

1. Membantu orang Indonesia melakukan interview kerja internasional.
2. Membantu freelancer/remote worker berkomunikasi dengan klien luar negeri.
3. Membantu meeting lintas bahasa.
4. Membantu pengguna Discord/game voice chat berbicara dengan komunitas global.
5. Menjadi AI interpreter personal berbasis desktop.

### 2.2 Tujuan Teknis

1. Membuat aplikasi desktop Windows yang stabil.
2. Mendukung realtime voice translation.
3. Mendukung output ke virtual microphone.
4. Menyimpan transcript percakapan.
5. Menghitung usage menit/audio.
6. Mendukung voice profile agar hasil suara bisa mirip suara pengguna sendiri.

---

## 3. Target Pengguna

### 3.1 Pengguna Utama

1. Job seeker Indonesia yang ingin interview dengan perusahaan luar negeri.
2. Freelancer yang bekerja dengan klien internasional.
3. Remote worker yang bekerja dengan tim global.
4. Gamer/Discord user yang ingin komunikasi dengan komunitas luar negeri.
5. Pelajar/mahasiswa yang ingin latihan komunikasi bahasa Inggris.
6. Customer support lokal yang melayani pelanggan asing.

### 3.2 Persona Utama

**Nama persona:** Danang  
**Profil:** Developer pemula-menengah dari Indonesia yang memiliki skill teknis, tetapi belum percaya diri berbicara bahasa Inggris langsung.  
**Masalah:** Saat interview atau meeting, ide sebenarnya ada, tapi sulit menyampaikan dalam bahasa Inggris secara cepat dan natural.  
**Kebutuhan:** Bisa tetap berbicara bahasa Indonesia, tetapi lawan bicara menerima bahasa Inggris yang natural dan profesional.

---

## 4. Masalah yang Diselesaikan

Banyak orang Indonesia memiliki kemampuan kerja yang baik, tetapi terhambat oleh kemampuan berbicara bahasa Inggris secara realtime.

Masalah utama:

1. Sulit berbicara bahasa Inggris spontan saat interview.
2. Takut salah grammar saat meeting.
3. Butuh waktu lama menerjemahkan jawaban di kepala.
4. Tidak percaya diri berbicara dengan klien luar negeri.
5. Translator biasa hanya menerjemahkan teks, bukan suara realtime ke aplikasi meeting.
6. Subtitle saja tidak cukup jika lawan bicara ingin mendengar suara.

TalkBridge AI menyelesaikan masalah ini dengan menjadi jembatan suara realtime.

---

## 5. Nilai Utama Produk

Value proposition:

> **TalkBridge AI membantu pengguna Indonesia berbicara dalam bahasa Indonesia, sementara lawan bicara mendengar bahasa Inggris secara realtime melalui aplikasi meeting atau voice chat.**

Keunggulan:

1. Berjalan sebagai aplikasi desktop Windows.
2. Bisa dipakai di Discord, Zoom, Meet, Teams, dan game voice chat.
3. Tidak hanya subtitle, tetapi bisa menghasilkan suara bahasa Inggris.
4. Bisa memakai suara yang mirip suara pengguna sendiri.
5. Ada mode Interview agar bahasa terdengar profesional.
6. Menyimpan transcript untuk evaluasi.
7. Bisa menjadi alat latihan bahasa Inggris dan interview.

---

## 6. Scope Produk

### 6.1 In Scope

Fitur yang masuk scope produk:

1. Aplikasi desktop Windows `.exe`.
2. Login dan register user.
3. Dashboard user.
4. Voice Translate Mode.
5. Pilih input microphone.
6. Pilih output audio device / virtual cable.
7. Bahasa awal: Indonesia.
8. Bahasa tujuan awal: English.
9. Speech-to-text.
10. Translation Indonesia ke English.
11. Text-to-speech English.
12. Output suara ke virtual microphone.
13. Transcript realtime.
14. Simpan history transcript.
15. Voice profile pengguna.
16. Usage tracking.
17. Plan/subscription basic.
18. Settings audio dan bahasa.
19. Floating widget.
20. Admin web sederhana untuk monitoring.

### 6.2 Out of Scope untuk Versi Awal

Fitur yang tidak dikerjakan di awal:

1. Custom virtual audio driver buatan sendiri.
2. Mobile app Android/iOS.
3. Offline translation penuh tanpa internet.
4. Auto-detect semua bahasa dunia.
5. Payment gateway kompleks.
6. Team management enterprise.
7. Video translation.
8. Lip-sync avatar.
9. Auto answer interview.
10. Meniru suara orang lain tanpa izin.

Catatan penting:

Untuk tahap awal, output ke aplikasi seperti Discord memakai **VB-CABLE / virtual audio cable eksternal**. Custom virtual microphone driver dibuat di fase profesional setelah produk stabil.

---

## 7. Platform

### 7.1 Platform Utama

- Windows Desktop App `.exe`

### 7.2 Platform Pendukung

- Backend API
- Admin Web
- PostgreSQL Database
- Storage untuk voice sample dan transcript

### 7.3 Aplikasi Target

Aplikasi yang harus bisa menerima output suara TalkBridge:

1. Discord
2. Zoom
3. Google Meet
4. Microsoft Teams
5. Game voice chat
6. OBS/streaming tools

---

## 8. User Flow Utama

### 8.1 Flow Login

```txt
User membuka TalkBridge.exe
        ↓
Aplikasi cek token login
        ↓
Jika belum login, tampil LoginPage
        ↓
User login/register
        ↓
Backend validasi akun
        ↓
User masuk Dashboard
```

### 8.2 Flow Setup Device

```txt
User masuk Device Setup
        ↓
Pilih input microphone asli
        ↓
Pilih output device: CABLE Input / Virtual Mic
        ↓
Test microphone
        ↓
Test output audio
        ↓
Simpan setting
```

### 8.3 Flow Voice Translate

```txt
User masuk Voice Translate
        ↓
Pilih mode: Interview / Meeting / Discord / Game
        ↓
Pilih bahasa asal: Indonesian
        ↓
Pilih bahasa tujuan: English
        ↓
Klik Start Voice Translate
        ↓
Aplikasi menangkap suara dari mic
        ↓
Audio dikirim ke backend/AI
        ↓
AI membuat teks Indonesia
        ↓
AI menerjemahkan ke English
        ↓
AI membuat suara English
        ↓
Desktop app memutar suara ke virtual audio device
        ↓
Discord/Zoom menerima suara English
```

### 8.4 Flow Discord

```txt
User buka Discord
        ↓
Masuk User Settings
        ↓
Voice & Video
        ↓
Input Device pilih CABLE Output / TalkBridge Virtual Mic
        ↓
User mulai bicara bahasa Indonesia
        ↓
Teman Discord mendengar bahasa Inggris
```

### 8.5 Flow Voice Profile

```txt
User masuk Voice Profile
        ↓
User membaca consent
        ↓
User merekam sample suara
        ↓
Sample dikirim ke backend
        ↓
Backend membuat voice profile lewat provider
        ↓
Provider mengembalikan voice_id
        ↓
voice_id disimpan di database
        ↓
User test suara English
        ↓
User set voice profile sebagai default
```

---

## 9. Fitur Produk

## 9.1 Authentication

### Deskripsi

User harus bisa membuat akun dan login ke aplikasi desktop.

### Requirement

1. User bisa register dengan name, email, password.
2. User bisa login dengan email dan password.
3. Password disimpan dalam bentuk hash.
4. Login menghasilkan access token.
5. Token disimpan aman di local app storage.
6. User bisa logout.
7. User yang belum login tidak bisa mengakses Voice Translate.

### Acceptance Criteria

1. Register berhasil membuat user baru di database.
2. Login berhasil membawa user ke dashboard.
3. Password tidak tersimpan dalam bentuk plain text.
4. Token invalid membuat user kembali ke login.

---

## 9.2 Dashboard

### Deskripsi

Dashboard menampilkan ringkasan akun dan status penggunaan.

### Requirement

1. Menampilkan nama user.
2. Menampilkan plan aktif.
3. Menampilkan usage bulan ini.
4. Menampilkan device aktif.
5. Menampilkan tombol cepat Start Voice Translate.
6. Menampilkan transcript terakhir.

### Acceptance Criteria

1. User bisa melihat status akun.
2. User bisa melihat jumlah menit yang sudah digunakan.
3. User bisa masuk ke Voice Translate dari dashboard.

---

## 9.3 Device Setup

### Deskripsi

User dapat memilih microphone asli dan output virtual audio device.

### Requirement

1. Aplikasi mendeteksi daftar microphone.
2. Aplikasi mendeteksi daftar output audio device.
3. User bisa memilih input mic.
4. User bisa memilih output device.
5. User bisa test microphone level.
6. User bisa test output sound.
7. Setting tersimpan di local storage dan backend.

### Acceptance Criteria

1. Daftar input microphone tampil.
2. Daftar output device tampil.
3. Pilihan device tersimpan setelah aplikasi ditutup.
4. Audio test berhasil keluar ke output device yang dipilih.

---

## 9.4 Voice Translate

### Deskripsi

Fitur inti untuk menerjemahkan suara Indonesia ke suara Inggris secara realtime.

### Requirement

1. User bisa klik Start Voice Translate.
2. Aplikasi menangkap audio dari mic.
3. Audio diproses secara realtime.
4. Sistem menampilkan original transcript.
5. Sistem menampilkan translated transcript.
6. Sistem menghasilkan audio English.
7. Audio English dikirim ke output virtual device.
8. User bisa klik Stop.
9. Sistem mencatat durasi sesi.
10. Sistem menyimpan transcript final.

### Mode

1. Interview Mode
2. Meeting Mode
3. Discord Mode
4. Game Mode
5. Casual Mode

### Perbedaan Mode

#### Interview Mode

- Bahasa dibuat formal.
- Kalimat dibuat profesional.
- Cocok untuk wawancara kerja.

#### Meeting Mode

- Bahasa jelas dan rapi.
- Cocok untuk diskusi kerja.

#### Discord Mode

- Bahasa lebih natural dan santai.
- Cocok untuk ngobrol.

#### Game Mode

- Terjemahan pendek dan cepat.
- Mengutamakan latency rendah.

### Acceptance Criteria

1. Saat user bicara Indonesia, teks Indonesia muncul.
2. Terjemahan English muncul.
3. Suara English keluar dari output device.
4. Sesi bisa dihentikan.
5. Transcript tersimpan setelah sesi selesai.

---

## 9.5 Voice Profile

### Deskripsi

User dapat membuat suara AI yang mirip dengan suara sendiri.

### Requirement

1. User bisa merekam sample suara.
2. User bisa upload sample suara.
3. User wajib membaca consent.
4. Sistem menyimpan consent recording.
5. Sistem mengirim sample ke provider voice cloning.
6. Sistem menyimpan voice_id.
7. User bisa test hasil suara.
8. User bisa memilih voice profile default.
9. User hanya boleh membuat voice profile dari suara miliknya sendiri.

### Safety Requirement

1. Harus ada persetujuan eksplisit user.
2. Tidak boleh membuat voice profile dari suara orang lain tanpa izin.
3. Harus ada audit log pembuatan voice profile.
4. Voice profile bisa dinonaktifkan jika melanggar aturan.

### Acceptance Criteria

1. User bisa membuat voice profile baru.
2. Voice profile punya status: `pending`, `ready`, `failed`, `disabled`.
3. Jika status `ready`, voice profile bisa dipakai di Voice Translate.
4. Consent audio tersimpan.

---

## 9.6 Transcript History

### Deskripsi

Sistem menyimpan riwayat percakapan dan terjemahan.

### Requirement

1. Menampilkan daftar sesi.
2. Menampilkan tanggal sesi.
3. Menampilkan mode sesi.
4. Menampilkan original text.
5. Menampilkan translated text.
6. Bisa search transcript.
7. Bisa delete transcript.
8. Bisa export transcript ke TXT.
9. Export PDF dapat dibuat di fase lanjutan.

### Acceptance Criteria

1. Setelah sesi selesai, transcript muncul di History.
2. User bisa membuka detail transcript.
3. User hanya bisa melihat transcript miliknya sendiri.

---

## 9.7 Usage Tracking

### Deskripsi

Sistem mencatat penggunaan menit/audio untuk menghitung limit dan biaya.

### Requirement

1. Mencatat waktu mulai sesi.
2. Mencatat waktu selesai sesi.
3. Menghitung durasi sesi.
4. Mencatat provider AI yang digunakan.
5. Mencatat estimasi biaya.
6. Mengurangi kuota user.
7. Menolak sesi jika kuota habis.

### Acceptance Criteria

1. Usage bertambah setelah sesi selesai.
2. Jika limit habis, user tidak bisa start Voice Translate.
3. User bisa melihat usage bulan ini.

---

## 9.8 Subscription / Plan

### Deskripsi

Produk mendukung paket penggunaan.

### Plan Awal

#### Free

- 30 menit/bulan.
- Voice standar.
- Transcript terbatas.

#### Pro

- 500 menit/bulan.
- Voice profile.
- Transcript history.
- Interview mode.

#### Business

- 3000+ menit/bulan.
- Admin dashboard.
- Team usage.
- Priority processing.

### Requirement

1. User punya plan aktif.
2. Plan menentukan batas menit.
3. Plan menentukan akses fitur.
4. Admin bisa mengubah plan user.

### Acceptance Criteria

1. User Free tidak bisa melewati batas menit.
2. User Pro bisa memakai voice profile.
3. Plan tampil di dashboard.

---

## 9.9 Floating Widget

### Deskripsi

Widget kecil yang tetap muncul ketika aplikasi diminimize.

### Requirement

1. Menampilkan status active/inactive.
2. Menampilkan latency.
3. Tombol mute.
4. Tombol stop.
5. Bisa dipindah posisinya.

### Acceptance Criteria

1. Widget muncul saat Voice Translate aktif.
2. User bisa stop sesi dari widget.
3. Widget tidak mengganggu aplikasi lain.

---

## 9.10 Admin Web

### Deskripsi

Admin web digunakan untuk monitoring user dan usage.

### Requirement

1. Admin bisa login.
2. Admin bisa melihat daftar user.
3. Admin bisa melihat usage.
4. Admin bisa melihat subscription.
5. Admin bisa suspend user.
6. Admin bisa melihat voice profile status.

### Acceptance Criteria

1. Hanya admin yang bisa masuk admin web.
2. Admin bisa melihat user dan usage.
3. Admin bisa menonaktifkan akun bermasalah.

---

## 10. Non-Functional Requirements

### 10.1 Performance

1. Target latency ideal: 1–3 detik.
2. Untuk Game Mode, target terjemahan dibuat lebih pendek.
3. Aplikasi tidak boleh freeze saat audio berjalan.
4. Audio processing harus berjalan async.
5. UI tetap responsif saat translation aktif.

### 10.2 Reliability

1. Jika koneksi putus, sesi berhenti dengan aman.
2. Jika AI provider error, tampilkan pesan jelas.
3. Jika output device tidak ditemukan, tampilkan warning.
4. Jika mic tidak tersedia, Start button disabled.

### 10.3 Security

1. Password wajib di-hash.
2. Token tidak boleh disimpan sembarangan.
3. API harus protected dengan auth.
4. User hanya bisa mengakses data miliknya.
5. Voice sample harus private.
6. Transcript harus private.
7. Admin action harus masuk audit log.

### 10.4 Privacy

1. User bisa menghapus transcript.
2. User bisa menghapus voice sample.
3. User bisa menonaktifkan voice profile.
4. Sistem harus menjelaskan bahwa audio diproses oleh AI provider.
5. Tidak boleh memakai suara orang lain tanpa izin.

### 10.5 Compatibility

1. Windows 10.
2. Windows 11.
3. Discord desktop.
4. Zoom desktop.
5. Browser meeting apps via virtual microphone.

---

## 11. Database Requirement

Tabel utama:

1. `users`
2. `desktop_devices`
3. `device_settings`
4. `translation_sessions`
5. `transcripts`
6. `usage_logs`
7. `voice_profiles`
8. `plans`
9. `subscriptions`
10. `audit_logs`

### 11.1 users

```txt
id
name
email
password_hash
role
is_active
created_at
updated_at
```

### 11.2 desktop_devices

```txt
id
user_id
device_id
device_name
os
app_version
last_login_at
created_at
```

### 11.3 device_settings

```txt
id
user_id
device_id
input_device_name
output_device_name
source_language
target_language
translation_mode
voice_profile_id
noise_suppression_enabled
auto_start_enabled
created_at
updated_at
```

### 11.4 translation_sessions

```txt
id
user_id
device_id
mode
source_language
target_language
status
started_at
ended_at
duration_seconds
created_at
```

### 11.5 transcripts

```txt
id
session_id
user_id
original_text
translated_text
is_final
created_at
```

### 11.6 usage_logs

```txt
id
user_id
session_id
provider
model
audio_input_seconds
audio_output_seconds
estimated_cost
created_at
```

### 11.7 voice_profiles

```txt
id
user_id
provider
voice_id
voice_name
status
sample_audio_url
consent_audio_url
language
created_at
updated_at
```

### 11.8 plans

```txt
id
name
monthly_price
max_minutes_per_month
allow_voice_profile
allow_transcript_history
allow_interview_mode
created_at
```

### 11.9 subscriptions

```txt
id
user_id
plan_id
status
started_at
expired_at
created_at
```

### 11.10 audit_logs

```txt
id
user_id
action
entity_type
entity_id
metadata_json
created_at
```

---

## 12. API Requirement

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
WS   /realtime/voice
POST /realtime/session/stop
```

### Voice Profile

```txt
POST   /voice-profiles
GET    /voice-profiles
GET    /voice-profiles/{id}
POST   /voice-profiles/{id}/test
PATCH  /voice-profiles/{id}/set-default
DELETE /voice-profiles/{id}
```

### Transcript

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

## 13. Struktur Project

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
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── desktop-app-flow.md
│   ├── audio-routing.md
│   ├── virtual-microphone.md
│   ├── realtime-translation-flow.md
│   ├── voice-cloning-flow.md
│   ├── database-schema.md
│   ├── api-contract.md
│   ├── deployment.md
│   └── security.md
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

## 14. Tech Stack

### Desktop

- Electron
- React
- TypeScript
- Vite
- electron-builder

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- WebSocket
- Redis optional

### AI Provider

- Speech-to-text provider
- Translation provider
- Text-to-speech provider
- Voice cloning provider

### Audio Routing

- VB-CABLE untuk versi awal
- Custom virtual microphone driver untuk versi profesional

### Admin Web

- Next.js
- TypeScript
- Tailwind CSS

---

## 15. Prioritas Pengerjaan

### Phase 1 — Foundation Desktop

1. Setup Electron app.
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
6. Buat tabel user dan device.
7. Hubungkan desktop app ke backend.

Output:

```txt
User bisa login dari desktop app.
```

### Phase 3 — Realtime Audio

1. Capture audio dari mic.
2. Kirim audio chunk ke backend.
3. Backend menerima audio stream.
4. Tampilkan audio level dan status.

Output:

```txt
Audio dari desktop berhasil masuk ke backend.
```

### Phase 4 — Translation Pipeline

1. Speech-to-text Indonesia.
2. Translate ke English.
3. Text-to-speech English.
4. Kirim audio English ke desktop.

Output:

```txt
User bicara Indonesia, aplikasi menghasilkan suara English.
```

### Phase 5 — Discord Output

1. Setup VB-CABLE.
2. Aplikasi output suara ke CABLE Input.
3. Discord input pilih CABLE Output.
4. Test call Discord.

Output:

```txt
Orang lain di Discord mendengar suara English.
```

### Phase 6 — Voice Profile

1. Record voice sample.
2. Record consent.
3. Generate voice profile.
4. Simpan voice_id.
5. Pakai voice profile untuk TTS.

Output:

```txt
Suara English terdengar mirip suara user.
```

### Phase 7 — Productization

1. Transcript history.
2. Usage tracking.
3. Plan limit.
4. Floating widget.
5. Installer `.exe`.
6. Error handling.
7. Basic admin web.

Output:

```txt
Produk siap diuji oleh user beta.
```

---

## 16. Risiko Produk

### 16.1 Risiko Teknis

1. Latency terlalu tinggi.
2. Audio routing tidak stabil.
3. Discord tidak menangkap virtual output dengan benar.
4. Voice cloning terdengar kurang natural.
5. AI provider mahal.
6. Koneksi internet mempengaruhi kualitas.

### 16.2 Risiko Etika

1. Voice cloning bisa disalahgunakan.
2. User bisa menyamar sebagai orang lain.
3. Penggunaan saat interview bisa dianggap sensitif jika tidak transparan.

### 16.3 Mitigasi

1. Wajib consent untuk voice profile.
2. Voice profile hanya untuk suara sendiri.
3. Audit log untuk pembuatan voice profile.
4. Batasi fitur clone voice untuk akun terverifikasi.
5. Beri disclosure bahwa suara diproses AI.
6. Sediakan mode latihan interview, bukan auto-answer.

---

## 17. Success Metrics

Produk dianggap berhasil jika:

1. User bisa menjalankan aplikasi `.exe` tanpa error.
2. User bisa memilih mic dan output device.
3. User bisa bicara bahasa Indonesia dan menghasilkan suara English.
4. Discord/Zoom bisa menerima suara English.
5. Latency rata-rata di bawah 3 detik untuk kalimat pendek.
6. Transcript tersimpan dengan benar.
7. Usage tercatat dengan benar.
8. Voice profile bisa digunakan dengan aman.
9. User merasa terbantu saat interview/meeting.

---

## 18. Definisi Versi

### 18.1 Alpha

- Desktop app berjalan.
- Mic capture berjalan.
- Translate text/audio dasar.
- Output ke virtual cable.
- Belum ada billing.

### 18.2 Beta

- Login/register.
- Transcript history.
- Usage tracking.
- Voice profile.
- Installer `.exe`.
- Bisa dipakai di Discord/Zoom.

### 18.3 Production

- Subscription.
- Admin panel.
- Error monitoring.
- Security hardening.
- Voice safety.
- Auto update.
- Dokumentasi lengkap.

---

## 19. Catatan Etika dan Batasan Penggunaan

TalkBridge AI harus diposisikan sebagai **alat bantu komunikasi**, bukan alat untuk menipu, menyamar, atau membuat jawaban palsu.

Aturan penggunaan:

1. User tetap bertanggung jawab atas isi jawaban.
2. Aplikasi hanya membantu menerjemahkan dan menyuarakan jawaban.
3. Voice profile hanya boleh dibuat dari suara milik sendiri.
4. Penggunaan suara AI harus mengikuti aturan platform dan hukum yang berlaku.
5. Untuk konteks interview, produk sebaiknya digunakan sebagai alat bantu bahasa, bukan auto-answer system.

---

## 20. Kesimpulan PRD

TalkBridge AI Desktop adalah aplikasi AI interpreter desktop yang memungkinkan user Indonesia berbicara dalam bahasa Indonesia, sementara lawan bicara di Discord, Zoom, Meet, atau aplikasi voice chat lain mendengar bahasa Inggris secara realtime.

Produk ini bukan translator biasa. Produk ini adalah gabungan dari:

```txt
AI Voice Translator
+ Virtual Microphone
+ Desktop App
+ Custom Voice Profile
+ Transcript & Usage System
```

Prioritas awal adalah membuat alur inti berjalan:

```txt
Mic Indonesia → AI Translate → English Voice → Virtual Mic → Discord
```

Setelah alur inti stabil, baru ditambahkan voice profile, usage tracking, subscription, admin panel, dan optimasi produk.
