# SECURITY.md — TalkBridge AI Desktop

## 1. Tujuan Dokumen

Dokumen ini menjelaskan aturan keamanan untuk pengembangan **TalkBridge AI Desktop**, aplikasi Windows `.exe` yang menangkap suara pengguna, menerjemahkan secara realtime, menghasilkan suara bahasa Inggris, dan mengirimkannya ke virtual microphone untuk Discord, Zoom, Google Meet, Microsoft Teams, atau aplikasi voice chat lain.

Fokus utama keamanan:

1. Melindungi akun pengguna.
2. Melindungi audio, transcript, dan voice profile.
3. Mencegah penyalahgunaan voice cloning.
4. Memastikan akses data sesuai pemiliknya.
5. Mencegah kebocoran API key dan credential.
6. Menjaga aplikasi tetap aman saat digunakan untuk interview, meeting, dan voice chat.

---

## 2. Prinsip Keamanan Utama

TalkBridge AI harus mengikuti prinsip berikut:

1. **Privacy by default** — data audio, transcript, voice sample, dan consent recording bersifat privat.
2. **Least privilege** — user hanya dapat mengakses data miliknya sendiri.
3. **Explicit consent** — voice profile hanya boleh dibuat dari suara milik pengguna dengan persetujuan eksplisit.
4. **Secure credential handling** — password, token, API key, dan provider secret tidak boleh disimpan sembarangan.
5. **Auditability** — aksi penting seperti pembuatan voice profile, perubahan plan, dan admin action wajib tercatat.
6. **Graceful failure** — jika provider AI error, aplikasi harus berhenti dengan aman dan memberi pesan jelas.
7. **No impersonation** — aplikasi tidak boleh digunakan untuk meniru suara orang lain tanpa izin.

---

## 3. Data Sensitif

Data berikut dianggap sensitif dan wajib dilindungi:

1. Password user.
2. Access token dan refresh token.
3. Voice sample.
4. Consent recording.
5. Voice provider ID / `voice_id`.
6. Transcript percakapan.
7. Audio sementara.
8. Usage log detail.
9. Payment/subscription data.
10. API key provider AI.
11. Device identifier.

---

## 4. Authentication Security

### 4.1 Register

Requirement:

1. Email harus unik.
2. Password minimal 8 karakter.
3. Password harus di-hash sebelum disimpan.
4. Password tidak boleh pernah dikembalikan oleh API.
5. Register tidak boleh otomatis memberikan role admin.

Password hashing:

- Gunakan `bcrypt` atau `argon2`.
- Jangan gunakan MD5, SHA1, atau SHA256 biasa untuk password.

### 4.2 Login

Requirement:

1. Login menggunakan email dan password.
2. Jika login gagal, pesan error harus generik.
3. Jangan beri tahu apakah email atau password yang salah.
4. Batasi percobaan login berulang.
5. Login berhasil menghasilkan access token.

Pesan error yang disarankan:

```txt
Email atau password tidak valid.
```

Jangan gunakan:

```txt
Email tidak ditemukan.
Password salah.
```

### 4.3 Token

Requirement:

1. Access token harus memiliki masa berlaku.
2. Refresh token, jika digunakan, harus disimpan lebih aman daripada access token.
3. Token harus dapat dicabut saat logout.
4. Token invalid harus membawa user kembali ke halaman login.
5. Desktop app tidak boleh menyimpan token di plain text tanpa proteksi.

Rekomendasi desktop storage:

1. Gunakan secure storage/keychain OS jika memungkinkan.
2. Jangan simpan token di file `.env`.
3. Jangan simpan token di repository.

---

## 5. Authorization Security

### 5.1 Role

Role awal:

```txt
user
admin
owner
```

Permission:

| Role | Akses |
|---|---|
| user | Mengakses akun, device, voice profile, transcript, dan usage miliknya sendiri |
| admin | Monitoring user, usage, subscription, voice profile status |
| owner | Akses penuh termasuk konfigurasi bisnis dan admin management |

### 5.2 Data Ownership

Aturan wajib:

1. User hanya boleh membaca transcript miliknya sendiri.
2. User hanya boleh membaca usage miliknya sendiri.
3. User hanya boleh mengelola voice profile miliknya sendiri.
4. User hanya boleh mengubah device setting miliknya sendiri.
5. Admin boleh membaca data operasional sesuai kebutuhan, tetapi semua aksi admin harus masuk audit log.

Contoh validasi backend:

```txt
transcript.user_id == current_user.id
voice_profile.user_id == current_user.id
device_setting.user_id == current_user.id
```

Jangan hanya mengandalkan filter frontend.

---

## 6. Voice Profile Security

Voice profile adalah area paling sensitif karena berkaitan dengan identitas suara pengguna.

### 6.1 Aturan Pembuatan Voice Profile

Requirement:

1. User wajib login.
2. User wajib membaca dan merekam consent statement.
3. User wajib menyetujui bahwa suara tersebut adalah suara miliknya sendiri.
4. Voice sample dan consent recording wajib disimpan terpisah.
5. Voice profile harus memiliki status.
6. Semua pembuatan, pengujian, dan penghapusan voice profile wajib masuk audit log.

Status voice profile:

```txt
pending
processing
ready
failed
disabled
deleted
```

### 6.2 Consent Statement

Contoh consent statement:

```txt
Saya menyatakan bahwa suara yang saya rekam adalah suara saya sendiri. Saya memberikan izin kepada TalkBridge AI untuk menggunakan rekaman ini hanya untuk membuat voice profile di akun saya.
```

Untuk versi bahasa Inggris:

```txt
I confirm that this is my own voice. I allow TalkBridge AI to use this recording only to create a voice profile for my own account.
```

### 6.3 Larangan

Aplikasi tidak boleh mendukung:

1. Upload suara orang lain tanpa izin.
2. Membuat voice profile tokoh publik.
3. Membuat voice profile rekan kerja, atasan, interviewer, streamer, atau pengguna lain tanpa izin.
4. Menjual fitur impersonation.
5. Menghapus audit trail voice profile.

### 6.4 Penghapusan Voice Profile

Requirement:

1. User bisa menghapus voice profile miliknya sendiri.
2. Jika provider mendukung delete remote voice, backend harus memanggil API delete provider.
3. Jika provider tidak mendukung delete penuh, status internal harus menjadi `deleted` atau `disabled`.
4. Voice sample dan consent recording harus mengikuti policy retensi.

---

## 7. Audio & Transcript Privacy

### 7.1 Audio Realtime

Requirement:

1. Audio realtime hanya diproses untuk sesi aktif.
2. Audio sementara harus dihapus setelah selesai diproses, kecuali user memilih menyimpan rekaman.
3. Audio tidak boleh digunakan untuk training internal tanpa persetujuan eksplisit.
4. Jika audio dikirim ke provider eksternal, aplikasi harus memberi disclosure di UI.

### 7.2 Transcript

Requirement:

1. Transcript default bersifat privat.
2. User bisa menghapus transcript miliknya.
3. User bisa menonaktifkan penyimpanan transcript jika fitur tersedia.
4. Transcript tidak boleh tampil di admin tanpa alasan operasional yang jelas.
5. Export transcript harus hanya bisa dilakukan oleh pemilik atau admin berwenang.

### 7.3 Data Retention

Rekomendasi default:

| Data | Retensi Default |
|---|---|
| Temporary audio chunk | Hapus setelah sesi selesai |
| Transcript | Simpan sampai user menghapus |
| Voice sample | Simpan selama voice profile aktif |
| Consent recording | Simpan selama voice profile aktif dan periode audit |
| Usage log | Simpan untuk billing dan audit |
| Audit log | Simpan jangka panjang |

---

## 8. Desktop App Security

### 8.1 Local Storage

Data lokal yang boleh disimpan:

1. Device setting.
2. Preferred language.
3. Preferred mode.
4. Non-sensitive UI preference.

Data lokal yang harus diproteksi:

1. Access token.
2. Refresh token.
3. Device identifier.
4. User session data.

Larangan:

1. Jangan simpan API key provider AI di aplikasi desktop.
2. Jangan hardcode backend URL production tanpa env/config.
3. Jangan simpan password user di desktop app.

### 8.2 Update App

Jika auto-update diterapkan:

1. Update harus berasal dari source tepercaya.
2. Installer harus ditandatangani jika memungkinkan.
3. Jangan menjalankan script update dari sumber tidak valid.
4. Versi app harus dicatat di backend melalui `desktop_devices.app_version`.

### 8.3 IPC Electron

Requirement:

1. Gunakan `preload.ts` untuk expose API terbatas.
2. Jangan aktifkan `nodeIntegration` di renderer tanpa alasan kuat.
3. Aktifkan `contextIsolation`.
4. Validasi semua payload IPC.
5. Jangan expose fungsi file system bebas ke renderer.

Konfigurasi yang disarankan:

```txt
contextIsolation: true
nodeIntegration: false
sandbox: true jika memungkinkan
```

---

## 9. API Security

### 9.1 General API Rules

Requirement:

1. Semua endpoint user data harus membutuhkan authentication.
2. Endpoint admin harus membutuhkan role admin/owner.
3. Input harus divalidasi dengan schema.
4. Response tidak boleh mengandung field sensitif.
5. Error harus informatif tapi tidak membocorkan detail internal.

### 9.2 CORS

Requirement:

1. CORS hanya mengizinkan origin yang dikenal.
2. Jangan gunakan wildcard `*` untuk production.
3. Pisahkan config development dan production.

### 9.3 Rate Limiting

Endpoint yang perlu rate limit:

1. `/auth/login`
2. `/auth/register`
3. `/voice-profiles`
4. `/voice-profiles/{id}/test`
5. `/realtime/session/start`
6. WebSocket realtime connection

### 9.4 File Upload

File upload berlaku untuk voice sample dan consent recording.

Requirement:

1. Batasi ukuran file.
2. Batasi tipe file.
3. Validasi MIME type dan extension.
4. Rename file saat disimpan.
5. Jangan simpan file dengan nama asli user secara langsung.
6. Jangan izinkan path traversal.

Format audio yang diizinkan:

```txt
.wav
.mp3
.m4a
.webm
```

---

## 10. Realtime Session Security

### 10.1 Session Start

Requirement:

1. User harus login.
2. Backend cek subscription dan usage limit.
3. Backend membuat `translation_session`.
4. Backend mengembalikan session id.
5. WebSocket harus memvalidasi token dan session id.

### 10.2 During Session

Requirement:

1. WebSocket hanya menerima audio dari pemilik session.
2. Backend harus bisa menghentikan session jika limit habis.
3. Backend harus bisa menghentikan session jika provider error.
4. Backend harus mencatat durasi input dan output.
5. Audio chunk invalid harus ditolak.

### 10.3 Session Stop

Requirement:

1. Session harus punya `ended_at`.
2. Usage harus dihitung.
3. Transcript final harus disimpan jika fitur aktif.
4. Temporary audio harus dibersihkan.

---

## 11. Audio Safety

### 11.1 Echo Cancellation & Feedback Prevention

Risiko:

Suara hasil AI dari virtual output atau suara lawan bicara bisa tertangkap kembali oleh microphone asli, diproses ulang, lalu menghasilkan feedback loop.

Requirement:

1. Tambahkan opsi Echo Cancellation.
2. Tambahkan Noise Suppression.
3. Tambahkan Automatic Gain Control jika diperlukan.
4. Sediakan Push-to-Talk.
5. Sediakan Pause/Mute instan.
6. Jangan memproses audio saat user mute/pause.
7. Beri warning jika input dan output device berisiko loop.

### 11.2 Device Routing Safety

Requirement:

1. Input mic dan output device tidak boleh sama jika berisiko feedback.
2. Jika output device tidak ditemukan, session tidak boleh start.
3. Jika virtual cable belum terpasang, tampilkan panduan setup.
4. Jika Discord belum memilih virtual input, tampilkan checklist manual.

---

## 12. Provider & API Key Security

Requirement:

1. API key OpenAI/ElevenLabs/Azure hanya disimpan di backend env.
2. Desktop app tidak boleh menerima API key provider.
3. Backend harus membungkus semua request provider.
4. Provider response yang mengandung metadata sensitif tidak boleh langsung dikirim penuh ke frontend.
5. Log tidak boleh mencetak API key.

Environment variable sensitif:

```txt
OPENAI_API_KEY
ELEVENLABS_API_KEY
AZURE_SPEECH_KEY
DATABASE_URL
JWT_SECRET_KEY
REDIS_URL
```

---

## 13. Billing & Fair Use Security

Requirement:

1. Usage harus dihitung dari audio input dan audio output.
2. Plan limit harus dicek sebelum session dimulai.
3. Plan limit harus dicek selama session berjalan.
4. User tidak boleh bisa memanipulasi durasi dari frontend.
5. Semua perhitungan usage dilakukan di backend.
6. Jika limit habis, session dihentikan dengan pesan jelas.

Fair use harus mempertimbangkan:

1. Durasi audio input.
2. Durasi audio output.
3. Provider/model yang dipakai.
4. Voice profile/custom voice cost.
5. Text token cost jika ada.

---

## 14. Error Handling & Graceful Degradation

Jika provider AI error:

1. Tampilkan status merah di UI.
2. Hentikan pengiriman audio baru sementara.
3. Simpan session state sebagai `failed` atau `interrupted`.
4. Beri pesan jelas: “Provider AI sedang bermasalah. Coba lagi beberapa saat.”
5. Jangan crash aplikasi.
6. Jangan menghapus transcript yang sudah berhasil dibuat.

Fallback strategy:

| Kondisi | Tindakan |
|---|---|
| STT provider error | Stop session, tampilkan pesan |
| Translation provider error | Tampilkan transcript original saja jika tersedia |
| TTS provider error | Fallback ke text-only mode jika memungkinkan |
| Network lost | Pause session, retry terbatas |
| Output device hilang | Stop output dan tampilkan setup warning |

---

## 15. Audit Log

Aksi yang wajib dicatat:

1. Register user.
2. Login gagal berulang.
3. Create voice profile.
4. Delete/disable voice profile.
5. Start translation session.
6. Stop translation session.
7. Usage limit reached.
8. Admin update user status.
9. Admin update subscription.
10. Failed provider request critical.

Field audit log:

```txt
id
user_id
action
entity_type
entity_id
metadata_json
ip_address
user_agent
created_at
```

---

## 16. Secure Development Rules

Developer/Codex/AI assistant wajib mengikuti aturan:

1. Jangan hardcode secret.
2. Jangan commit `.env`.
3. Jangan expose provider API key ke desktop app.
4. Jangan bypass auth untuk testing tanpa flag development yang jelas.
5. Jangan membuat endpoint admin tanpa role check.
6. Jangan membuat fitur voice cloning tanpa consent.
7. Jangan menghapus audit log.
8. Jangan mengubah schema besar tanpa update database documentation.
9. Jangan membuat refactor besar tanpa alasan jelas.
10. Utamakan clean code dan validasi input.

---

## 17. Security Checklist Sebelum Beta

Checklist wajib sebelum beta release:

- [ ] Password sudah di-hash.
- [ ] JWT secret tidak hardcoded.
- [ ] API key hanya ada di backend.
- [ ] CORS production tidak wildcard.
- [ ] User data ownership divalidasi di backend.
- [ ] Admin endpoint punya role check.
- [ ] Voice profile wajib consent.
- [ ] Upload audio punya size/type validation.
- [ ] Transcript private per user.
- [ ] Usage dihitung backend-side.
- [ ] WebSocket memvalidasi token.
- [ ] Temporary audio dibersihkan.
- [ ] Echo cancellation tersedia.
- [ ] Pause/mute/PTT tersedia.
- [ ] Provider error tidak membuat app crash.
- [ ] Audit log aktif untuk aksi penting.

---

## 18. Security Checklist Sebelum Production

- [ ] Penetration test basic API.
- [ ] Dependency vulnerability scan.
- [ ] Installer signing jika memungkinkan.
- [ ] Secure token storage desktop.
- [ ] Backup database terjadwal.
- [ ] Monitoring error dan usage abnormal.
- [ ] Rate limit endpoint sensitif.
- [ ] Data retention policy diterapkan.
- [ ] Delete account/data workflow tersedia.
- [ ] Admin activity monitoring tersedia.
- [ ] Payment security review jika billing aktif.
