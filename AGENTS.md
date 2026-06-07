# AGENTS.md — TalkBridge AI Desktop

## 1. Tujuan File Ini

File ini adalah instruksi kerja untuk AI coding agent/Codex saat membantu mengembangkan **TalkBridge AI Desktop**.

Project ini adalah aplikasi desktop Windows `.exe` untuk realtime voice translation:

```txt
User bicara bahasa Indonesia
        ↓
Aplikasi menerjemahkan ke bahasa Inggris
        ↓
Hasil suara English dikirim ke virtual microphone
        ↓
Discord/Zoom/Meet menerima suara English
```

AI agent wajib mengikuti dokumen ini agar perubahan tetap aman, bersih, dan sesuai arah produk.

---

## 2. Dokumen Wajib Dibaca Sebelum Coding

Sebelum membuat perubahan besar, baca dan ikuti dokumen berikut:

```txt
docs/PRD.md
docs/technical.md
docs/database.md
docs/security.md
README.md
AGENTS.md
```

Jika dokumen belum dipindahkan ke folder `docs/`, gunakan file di root project dengan nama yang sama.

Urutan referensi:

1. `PRD.md` menentukan kebutuhan produk.
2. `technical.md` menentukan arsitektur teknis.
3. `database.md` menentukan schema dan relasi data.
4. `security.md` menentukan batasan keamanan.
5. `AGENTS.md` menentukan cara kerja coding agent.

---

## 3. Prinsip Utama Pengembangan

AI agent harus mengikuti prinsip berikut:

1. **Clean code first.**
2. **Security first untuk auth, audio, transcript, voice profile, dan provider API key.**
3. **Tidak membuat refactor besar tanpa kebutuhan jelas.**
4. **Tidak menambah fitur di luar PRD tanpa izin.**
5. **Tidak mengubah database schema tanpa update dokumentasi dan migration.**
6. **Tidak hardcode URL, API key, token, atau credential.**
7. **Tidak membuat voice cloning tanpa consent flow.**
8. **Tidak menghapus audit log atau safety check.**
9. **Menjaga desktop app, backend, dan database tetap sinkron.**
10. **Selalu prioritaskan implementasi bertahap dan mudah diuji.**

---

## 4. Scope Project

Project terdiri dari:

```txt
apps/desktop   → Electron + React + TypeScript desktop app
apps/api       → FastAPI backend
apps/admin-web → Admin dashboard, fase lanjutan
packages       → shared types/config
docs           → documentation
database       → schema/seed/ERD documentation
```

Fokus awal:

1. Desktop app foundation.
2. Backend auth + database.
3. Device setup.
4. Realtime audio path.
5. Translation pipeline.
6. Virtual audio output.
7. Voice profile.
8. Usage/transcript.

---

## 5. Tech Stack yang Harus Diikuti

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
Pydantic
WebSocket
JWT Auth
```

### AI Provider

Provider harus modular:

```txt
STT Provider
Translation Provider
TTS Provider
Voice Cloning Provider
```

Jangan menulis logic provider langsung di route.

---

## 6. Struktur Backend yang Wajib Diikuti

Gunakan pola:

```txt
routes → services → repositories → models/database
```

### routes/

Tugas:

1. Menerima request.
2. Validasi auth/role dependency.
3. Memanggil service.
4. Mengembalikan response.

Route tidak boleh berisi business logic besar.

### services/

Tugas:

1. Business logic.
2. Orkestrasi provider.
3. Validasi aturan produk.
4. Usage calculation.
5. Session lifecycle.

### repositories/

Tugas:

1. Query database.
2. Create/update/delete model.
3. Tidak memanggil provider eksternal.

### providers/

Tugas:

1. Integrasi OpenAI/ElevenLabs/Azure/provider lain.
2. Semua provider harus dibungkus interface.
3. Jangan panggil provider langsung dari route.

---

## 7. Struktur Desktop yang Wajib Diikuti

Desktop app dibagi menjadi:

```txt
electron/   → main process, preload, ipc, tray, windows
renderer/   → React UI
native/     → native audio helper jika diperlukan
resources/  → icon/installer assets
```

### Electron Main Process

Boleh menangani:

1. Window lifecycle.
2. Tray.
3. IPC.
4. Native OS integration.
5. Secure storage helper jika digunakan.

Tidak boleh:

1. Menyimpan API key provider AI.
2. Mengandung business logic translation besar.
3. Mengekspos file system bebas ke renderer.

### Renderer

Boleh menangani:

1. UI.
2. Device selection.
3. Audio visualizer.
4. Start/stop/pause/mute button.
5. WebSocket client.
6. Menampilkan transcript dan translation.

Tidak boleh:

1. Menyimpan provider API key.
2. Menghitung usage final.
3. Bypass auth.
4. Mengakses data user lain.

---

## 8. Security Rules yang Tidak Boleh Dilanggar

1. Password wajib di-hash.
2. Jangan simpan password plain text.
3. Jangan commit `.env`.
4. Jangan hardcode secret.
5. Jangan expose provider API key ke desktop app.
6. Semua endpoint user data wajib auth.
7. Semua admin endpoint wajib role check.
8. User hanya boleh mengakses data miliknya.
9. Voice profile wajib consent recording.
10. Upload audio wajib validasi size/type.
11. Transcript harus private.
12. WebSocket wajib validasi token/session.
13. Usage dihitung di backend.
14. Audit log wajib untuk aksi penting.
15. Jangan membuat fitur impersonation suara orang lain.

---

## 9. Voice Profile Rules

Voice profile adalah fitur sensitif.

AI agent tidak boleh:

1. Membuat voice cloning tanpa consent flow.
2. Mengizinkan upload suara orang lain sebagai default behavior.
3. Membuat fitur meniru tokoh publik.
4. Menghapus consent recording secara diam-diam.
5. Menghapus audit log voice profile.

AI agent harus memastikan:

1. Ada status `pending`, `processing`, `ready`, `failed`, `disabled`, `deleted`.
2. Ada consent text.
3. Ada consent audio.
4. Ada ownership check.
5. Ada audit log.
6. User bisa delete/disable voice profile miliknya.

---

## 10. Audio & Realtime Rules

Saat mengubah audio/realtime flow, jaga hal berikut:

1. Ada Start, Stop, Pause, Mute.
2. Push-to-Talk harus didukung sebagai mode.
3. Jangan proses audio saat pause/mute.
4. Tampilkan status koneksi dan status AI.
5. Tampilkan latency indicator.
6. Handle provider error tanpa crash.
7. Jangan membuat loop audio antara input dan output.
8. Tambahkan warning jika input/output device berisiko feedback.
9. Output audio harus bisa diarahkan ke virtual audio device.
10. Jangan menganggap Discord/Zoom otomatis menerima output; tetap butuh device setup.

Status UI:

```txt
Green  = ready/active
Yellow = processing/reconnecting/high latency
Red    = error/provider down/device missing
Gray   = paused/muted
```

---

## 11. Database Rules

Jika mengubah database:

1. Buat migration Alembic.
2. Update `docs/database.md`.
3. Jangan drop table/column tanpa izin.
4. Jangan rename table/column tanpa alasan kuat.
5. Tambahkan index untuk foreign key dan query penting.
6. Pastikan data user-owned punya `user_id`.
7. Pastikan authorization backend memakai `user_id`.
8. Jangan menyimpan raw audio permanen kecuali memang diperlukan dan disetujui.
9. Jangan menyimpan API key provider di tabel biasa.
10. Usage logs harus memisahkan input audio, output audio, dan estimated cost.

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

---

## 12. API Rules

Endpoint wajib mengikuti naming konsisten:

```txt
/auth
/desktop
/realtime
/voice-profiles
/transcripts
/usage
/subscriptions
/admin
```

Response error harus rapi:

```json
{
  "detail": "Pesan error aman untuk user",
  "code": "ERROR_CODE"
}
```

Jangan mengembalikan:

1. Stack trace.
2. API key.
3. Provider raw secret.
4. Password hash.
5. Data user lain.

---

## 13. Error Handling Rules

Error yang harus ditangani:

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

Jika provider error:

1. Jangan crash app.
2. Tampilkan status merah.
3. Simpan session sebagai failed/interrupted.
4. Simpan transcript yang sudah ada.
5. Fallback ke text-only jika memungkinkan.

---

## 14. Clean Code Standards

Wajib:

1. Nama file jelas.
2. Nama function jelas.
3. Function kecil dan single-purpose.
4. Hindari duplicate logic.
5. Validasi input di boundary.
6. Gunakan type/schema.
7. Pisahkan UI, service, repository, provider.
8. Jangan membuat file raksasa.
9. Tambahkan komentar hanya jika membantu.
10. Jangan membuat over-engineering yang belum dibutuhkan.

Backend:

1. Route tipis.
2. Service jelas.
3. Repository khusus query.
4. Provider pakai interface.
5. Exception konsisten.

Frontend/Desktop:

1. Component kecil.
2. Hook untuk logic reusable.
3. Store untuk state global seperlunya.
4. Service untuk API call.
5. TypeScript type jelas.

---

## 15. Testing Rules

Tambahkan test untuk logic penting:

Backend:

1. Auth service.
2. Usage calculation.
3. Subscription limit.
4. Ownership check.
5. Voice profile consent validation.
6. Session lifecycle.

Desktop manual test:

1. App bisa dibuka.
2. Mic terdeteksi.
3. Output device terdeteksi.
4. Start/Stop berjalan.
5. Pause/Mute berjalan.
6. Audio level tampil.
7. WebSocket connect/disconnect aman.
8. Output ke virtual cable bisa diuji.

---

## 16. Git & Commit Rules

1. Jangan commit `.env`.
2. Jangan commit file audio sample pribadi.
3. Jangan commit build output besar.
4. Commit harus fokus pada satu topik.
5. Pesan commit jelas.
6. Jangan melakukan formatting massal tanpa kebutuhan.
7. Jangan mengubah file tidak terkait.

Contoh commit message:

```txt
Add desktop device settings model
Implement auth login endpoint
Add realtime session start flow
Fix usage limit calculation
```

---

## 17. Implementation Order

AI agent harus mengikuti urutan ini kecuali user memberi instruksi lain:

### Phase 1 — Desktop Foundation

1. Setup Electron + React + TypeScript.
2. Layout desktop.
3. DashboardPage.
4. VoiceTranslatePage.
5. Detect microphone.
6. Detect output device.
7. Local settings.

### Phase 2 — Backend + Database

1. Setup FastAPI.
2. Setup PostgreSQL.
3. SQLAlchemy + Alembic.
4. Auth register/login.
5. Users/devices/settings tables.
6. Desktop app connect to backend.

### Phase 3 — Realtime Audio Base

1. Capture mic.
2. Audio level meter.
3. WebSocket audio chunk.
4. Backend receive audio.
5. Dummy transcript response.

### Phase 4 — Translation Pipeline

1. STT.
2. Translation.
3. TTS.
4. Audio output to desktop.

### Phase 5 — Virtual Audio Output

1. VB-CABLE setup support.
2. Output to selected device.
3. Discord test guide.

### Phase 6 — Voice Profile

1. Consent recording.
2. Voice sample upload.
3. Provider voice profile.
4. Default voice setting.

### Phase 7 — Productization

1. Transcript history.
2. Usage tracking.
3. Plan limit.
4. Floating widget.
5. Installer.
6. Admin web basic.

---

## 18. Forbidden Changes Without Approval

Jangan lakukan hal berikut tanpa izin eksplisit:

1. Mengubah stack utama.
2. Mengganti Electron dengan framework lain.
3. Mengganti FastAPI dengan framework lain.
4. Menghapus PostgreSQL.
5. Menghapus auth.
6. Menghapus usage limit.
7. Menghapus consent untuk voice profile.
8. Menghapus audit log.
9. Membuat custom Windows audio driver langsung di fase awal.
10. Mengubah PRD scope besar-besaran.
11. Menambahkan auto-answer interview.
12. Menambahkan fitur menipu interviewer/meeting participant.

---

## 19. When Unsure

Jika ragu:

1. Jangan tebak schema.
2. Jangan buat refactor besar.
3. Baca dokumen terkait.
4. Buat perubahan kecil yang aman.
5. Jelaskan risiko dan minta keputusan user.

Untuk project ini, lebih baik lambat tapi rapi daripada cepat tapi berantakan.

---

## 20. Definition of Done for AI Agent

Sebuah task dianggap selesai jika:

1. Sesuai PRD.
2. Sesuai technical design.
3. Sesuai database design jika menyentuh data.
4. Sesuai security rules.
5. Tidak ada secret hardcoded.
6. Tidak ada akses data lintas user.
7. Error handling tersedia.
8. Code bersih dan modular.
9. Dokumentasi diperbarui jika perlu.
10. Manual test instruction diberikan jika fitur perlu diuji manual.
