# DATABASE.md — TalkBridge AI Desktop

## 1. Tujuan Dokumen

Dokumen ini menjelaskan desain database untuk **TalkBridge AI Desktop**, aplikasi desktop realtime voice translator yang menangkap suara pengguna, menerjemahkan bahasa Indonesia ke bahasa Inggris, menghasilkan suara bahasa Inggris, dan mengirimkannya ke virtual microphone untuk Discord, Zoom, Google Meet, Microsoft Teams, atau aplikasi voice chat lain.

Database digunakan untuk:

1. Menyimpan user dan role.
2. Menyimpan desktop device user.
3. Menyimpan device/audio setting.
4. Menyimpan translation session.
5. Menyimpan transcript.
6. Menyimpan usage log untuk limit dan billing.
7. Menyimpan voice profile dan consent.
8. Menyimpan plan dan subscription.
9. Menyimpan audit log.

Database utama: **PostgreSQL**.

---

## 2. Prinsip Desain Database

1. Gunakan UUID untuk primary key.
2. Semua tabel penting memiliki `created_at` dan `updated_at`.
3. Semua data user-owned harus memiliki `user_id`.
4. Jangan simpan password plain text.
5. Jangan simpan API key provider AI di database kecuali terenkripsi dan memang diperlukan.
6. Transcript, voice sample, dan consent recording harus bisa dihapus/nonaktif sesuai policy.
7. Usage dihitung dari backend, bukan dari frontend.
8. Hindari hard delete untuk data audit penting.
9. Gunakan enum/check constraint untuk status penting.
10. Buat index untuk query yang sering dipakai.

---

## 3. Entity Relationship Overview

Relasi utama:

```txt
users
  ├── desktop_devices
  ├── device_settings
  ├── translation_sessions
  │       ├── transcripts
  │       └── usage_logs
  ├── voice_profiles
  ├── subscriptions
  └── audit_logs

plans
  └── subscriptions
```

---

## 4. Enum / Status

Enum yang disarankan:

### user_role

```txt
user
admin
owner
```

### subscription_status

```txt
active
inactive
expired
cancelled
trial
past_due
```

### translation_session_status

```txt
created
active
paused
stopped
completed
failed
interrupted
```

### translation_mode

```txt
interview
meeting
discord
game
casual
```

### voice_profile_status

```txt
pending
processing
ready
failed
disabled
deleted
```

### provider_name

```txt
openai
elevenlabs
azure
local
```

---

## 5. Tabel: users

Menyimpan akun pengguna.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID user |
| name | varchar(150) | not null | Nama user |
| email | varchar(255) | unique, not null | Email login |
| password_hash | text | not null | Password hash |
| role | varchar(30) | not null default 'user' | Role user |
| is_active | boolean | default true | Status aktif |
| last_login_at | timestamptz | nullable | Login terakhir |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Index

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

---

## 6. Tabel: desktop_devices

Menyimpan device yang pernah login ke aplikasi desktop.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID device row |
| user_id | uuid | fk users.id, not null | Pemilik device |
| device_id | varchar(255) | not null | Identifier device dari app |
| device_name | varchar(255) | nullable | Nama device |
| os | varchar(100) | nullable | OS, contoh Windows 11 |
| app_version | varchar(50) | nullable | Versi TalkBridge app |
| last_login_at | timestamptz | nullable | Login terakhir dari device |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Constraint

```sql
UNIQUE(user_id, device_id)
```

### Index

```sql
CREATE INDEX idx_desktop_devices_user_id ON desktop_devices(user_id);
CREATE INDEX idx_desktop_devices_device_id ON desktop_devices(device_id);
```

---

## 7. Tabel: device_settings

Menyimpan setting input/output audio dan preferensi translation user.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID setting |
| user_id | uuid | fk users.id, not null | Pemilik setting |
| device_id | uuid | fk desktop_devices.id, nullable | Device terkait |
| input_device_name | varchar(255) | nullable | Mic asli |
| input_device_id | varchar(255) | nullable | ID mic lokal |
| output_device_name | varchar(255) | nullable | Output virtual cable |
| output_device_id | varchar(255) | nullable | ID output lokal |
| source_language | varchar(20) | default 'id' | Bahasa asal |
| target_language | varchar(20) | default 'en' | Bahasa tujuan |
| translation_mode | varchar(30) | default 'discord' | Mode translation |
| voice_profile_id | uuid | fk voice_profiles.id, nullable | Voice profile default |
| echo_cancellation_enabled | boolean | default true | AEC aktif |
| noise_suppression_enabled | boolean | default true | Noise suppression |
| auto_gain_control_enabled | boolean | default false | Auto gain control |
| push_to_talk_enabled | boolean | default false | PTT aktif |
| auto_start_enabled | boolean | default false | Auto start app/session |
| save_transcript_enabled | boolean | default true | Simpan transcript |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Index

```sql
CREATE INDEX idx_device_settings_user_id ON device_settings(user_id);
CREATE INDEX idx_device_settings_device_id ON device_settings(device_id);
```

---

## 8. Tabel: translation_sessions

Menyimpan sesi realtime voice translation.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID session |
| user_id | uuid | fk users.id, not null | Pemilik session |
| device_id | uuid | fk desktop_devices.id, nullable | Device yang dipakai |
| mode | varchar(30) | not null | interview/meeting/discord/game/casual |
| source_language | varchar(20) | not null default 'id' | Bahasa input |
| target_language | varchar(20) | not null default 'en' | Bahasa output |
| status | varchar(30) | not null | Status session |
| provider | varchar(50) | nullable | Provider utama |
| stt_model | varchar(100) | nullable | Model speech-to-text |
| translation_model | varchar(100) | nullable | Model translate |
| tts_model | varchar(100) | nullable | Model TTS |
| voice_profile_id | uuid | fk voice_profiles.id, nullable | Voice profile dipakai |
| started_at | timestamptz | nullable | Waktu mulai |
| paused_at | timestamptz | nullable | Waktu pause terakhir |
| ended_at | timestamptz | nullable | Waktu selesai |
| duration_seconds | integer | default 0 | Durasi session |
| error_code | varchar(100) | nullable | Kode error jika gagal |
| error_message | text | nullable | Pesan error aman |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Index

```sql
CREATE INDEX idx_translation_sessions_user_id ON translation_sessions(user_id);
CREATE INDEX idx_translation_sessions_status ON translation_sessions(status);
CREATE INDEX idx_translation_sessions_started_at ON translation_sessions(started_at);
```

---

## 9. Tabel: transcripts

Menyimpan transcript original dan hasil terjemahan.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID transcript |
| session_id | uuid | fk translation_sessions.id, not null | Sesi terkait |
| user_id | uuid | fk users.id, not null | Pemilik transcript |
| sequence_number | integer | not null default 1 | Urutan transcript |
| original_text | text | nullable | Teks bahasa Indonesia |
| translated_text | text | nullable | Teks bahasa Inggris |
| source_language | varchar(20) | default 'id' | Bahasa original |
| target_language | varchar(20) | default 'en' | Bahasa terjemahan |
| is_final | boolean | default false | Final/partial |
| confidence_score | numeric(5,4) | nullable | Confidence STT jika tersedia |
| started_at | timestamptz | nullable | Awal segmen |
| ended_at | timestamptz | nullable | Akhir segmen |
| created_at | timestamptz | not null | Waktu dibuat |

### Index

```sql
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX idx_transcripts_created_at ON transcripts(created_at);
```

---

## 10. Tabel: usage_logs

Mencatat penggunaan AI untuk limit, billing, dan analitik biaya.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID usage |
| user_id | uuid | fk users.id, not null | Pemilik usage |
| session_id | uuid | fk translation_sessions.id, nullable | Sesi terkait |
| provider | varchar(50) | not null | Provider |
| stt_model | varchar(100) | nullable | Model STT |
| translation_model | varchar(100) | nullable | Model translate |
| tts_model | varchar(100) | nullable | Model TTS |
| audio_input_seconds | numeric(12,2) | default 0 | Durasi audio input |
| audio_output_seconds | numeric(12,2) | default 0 | Durasi audio output |
| text_input_tokens | integer | default 0 | Token input |
| text_output_tokens | integer | default 0 | Token output |
| estimated_stt_cost | numeric(12,6) | default 0 | Estimasi biaya STT |
| estimated_translation_cost | numeric(12,6) | default 0 | Estimasi biaya translate |
| estimated_tts_cost | numeric(12,6) | default 0 | Estimasi biaya TTS |
| estimated_total_cost | numeric(12,6) | default 0 | Total estimasi biaya |
| created_at | timestamptz | not null | Waktu dibuat |

### Index

```sql
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_session_id ON usage_logs(session_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
```

### Catatan Fair Use

Limit plan tidak boleh hanya melihat total durasi session. Perhitungan harus mempertimbangkan:

1. Audio input seconds.
2. Audio output seconds.
3. Model/provider yang digunakan.
4. Voice profile/custom voice cost.
5. Token text jika pipeline memakai LLM text.

---

## 11. Tabel: voice_profiles

Menyimpan voice profile yang dibuat dari suara user sendiri.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID voice profile |
| user_id | uuid | fk users.id, not null | Pemilik voice profile |
| provider | varchar(50) | not null | elevenlabs/azure/openai/local |
| voice_id | varchar(255) | nullable | ID dari provider |
| voice_name | varchar(150) | not null | Nama voice profile |
| status | varchar(30) | not null | pending/processing/ready/failed/disabled/deleted |
| sample_audio_url | text | nullable | Lokasi sample audio |
| consent_audio_url | text | nullable | Lokasi consent audio |
| language | varchar(20) | default 'id' | Bahasa sample |
| consent_text | text | nullable | Teks consent yang dibaca |
| is_default | boolean | default false | Default voice user |
| failure_reason | text | nullable | Alasan gagal aman ditampilkan |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |
| deleted_at | timestamptz | nullable | Soft delete |

### Index

```sql
CREATE INDEX idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX idx_voice_profiles_status ON voice_profiles(status);
CREATE INDEX idx_voice_profiles_is_default ON voice_profiles(is_default);
```

### Rule

1. Hanya satu default voice profile per user.
2. Voice profile wajib punya consent recording sebelum status `ready`.
3. User tidak boleh mengakses voice profile milik user lain.

---

## 12. Tabel: plans

Menyimpan paket penggunaan.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID plan |
| name | varchar(100) | unique, not null | Nama plan |
| monthly_price | numeric(12,2) | default 0 | Harga bulanan |
| max_minutes_per_month | integer | not null | Limit menit bulanan |
| max_audio_input_seconds | integer | nullable | Limit input audio |
| max_audio_output_seconds | integer | nullable | Limit output audio |
| allow_voice_profile | boolean | default false | Boleh custom voice |
| allow_transcript_history | boolean | default true | Boleh history |
| allow_interview_mode | boolean | default false | Boleh Interview Mode |
| allow_export | boolean | default false | Boleh export transcript |
| is_active | boolean | default true | Status plan |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Plan Awal

```txt
Free
- 30 menit/bulan
- Voice standar
- Transcript terbatas

Pro
- 500 menit/bulan
- Voice profile
- Transcript history
- Interview mode

Business
- 3000+ menit/bulan
- Admin dashboard
- Team usage
- Priority processing
```

---

## 13. Tabel: subscriptions

Menyimpan subscription aktif user.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID subscription |
| user_id | uuid | fk users.id, not null | Pemilik subscription |
| plan_id | uuid | fk plans.id, not null | Plan aktif |
| status | varchar(30) | not null | active/inactive/expired/cancelled/trial |
| started_at | timestamptz | not null | Mulai |
| expired_at | timestamptz | nullable | Berakhir |
| cancelled_at | timestamptz | nullable | Dibatalkan |
| created_at | timestamptz | not null | Waktu dibuat |
| updated_at | timestamptz | not null | Waktu update |

### Index

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## 14. Tabel: audit_logs

Mencatat aksi penting untuk keamanan dan operasional.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID audit |
| user_id | uuid | fk users.id, nullable | User pelaku |
| action | varchar(100) | not null | Nama aksi |
| entity_type | varchar(100) | nullable | Jenis entity |
| entity_id | uuid | nullable | ID entity |
| metadata_json | jsonb | nullable | Metadata tambahan |
| ip_address | varchar(100) | nullable | IP address |
| user_agent | text | nullable | User agent |
| created_at | timestamptz | not null | Waktu dibuat |

### Aksi yang Dicatat

```txt
user.registered
user.login_failed
user.login_success
device.registered
session.started
session.stopped
session.failed
voice_profile.created
voice_profile.ready
voice_profile.deleted
usage.limit_reached
admin.user_suspended
admin.subscription_updated
```

### Index

```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 15. Optional Table: provider_events

Dipakai untuk debugging provider AI tanpa menyimpan data sensitif terlalu banyak.

### Columns

| Column | Type | Constraint | Keterangan |
|---|---|---|---|
| id | uuid | pk | ID event |
| user_id | uuid | fk users.id, nullable | User terkait |
| session_id | uuid | fk translation_sessions.id, nullable | Session terkait |
| provider | varchar(50) | not null | Provider |
| event_type | varchar(100) | not null | Jenis event |
| status_code | integer | nullable | HTTP/status code |
| safe_message | text | nullable | Pesan aman |
| created_at | timestamptz | not null | Waktu dibuat |

Catatan:

1. Jangan simpan API key.
2. Jangan simpan full raw audio.
3. Jangan simpan raw provider response yang mengandung data sensitif.

---

## 16. Initial SQL Draft

Contoh draft awal. Detail final tetap dikelola melalui Alembic migrations.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE desktop_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    os VARCHAR(100),
    app_version VARCHAR(50),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    voice_id VARCHAR(255),
    voice_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    sample_audio_url TEXT,
    consent_audio_url TEXT,
    language VARCHAR(20) NOT NULL DEFAULT 'id',
    consent_text TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE device_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES desktop_devices(id) ON DELETE SET NULL,
    input_device_name VARCHAR(255),
    input_device_id VARCHAR(255),
    output_device_name VARCHAR(255),
    output_device_id VARCHAR(255),
    source_language VARCHAR(20) NOT NULL DEFAULT 'id',
    target_language VARCHAR(20) NOT NULL DEFAULT 'en',
    translation_mode VARCHAR(30) NOT NULL DEFAULT 'discord',
    voice_profile_id UUID REFERENCES voice_profiles(id) ON DELETE SET NULL,
    echo_cancellation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    noise_suppression_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_gain_control_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    push_to_talk_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_start_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    save_transcript_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE translation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES desktop_devices(id) ON DELETE SET NULL,
    mode VARCHAR(30) NOT NULL DEFAULT 'discord',
    source_language VARCHAR(20) NOT NULL DEFAULT 'id',
    target_language VARCHAR(20) NOT NULL DEFAULT 'en',
    status VARCHAR(30) NOT NULL DEFAULT 'created',
    provider VARCHAR(50),
    stt_model VARCHAR(100),
    translation_model VARCHAR(100),
    tts_model VARCHAR(100),
    voice_profile_id UUID REFERENCES voice_profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES translation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL DEFAULT 1,
    original_text TEXT,
    translated_text TEXT,
    source_language VARCHAR(20) NOT NULL DEFAULT 'id',
    target_language VARCHAR(20) NOT NULL DEFAULT 'en',
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    confidence_score NUMERIC(5,4),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES translation_sessions(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    stt_model VARCHAR(100),
    translation_model VARCHAR(100),
    tts_model VARCHAR(100),
    audio_input_seconds NUMERIC(12,2) NOT NULL DEFAULT 0,
    audio_output_seconds NUMERIC(12,2) NOT NULL DEFAULT 0,
    text_input_tokens INTEGER NOT NULL DEFAULT 0,
    text_output_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_stt_cost NUMERIC(12,6) NOT NULL DEFAULT 0,
    estimated_translation_cost NUMERIC(12,6) NOT NULL DEFAULT 0,
    estimated_tts_cost NUMERIC(12,6) NOT NULL DEFAULT 0,
    estimated_total_cost NUMERIC(12,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_minutes_per_month INTEGER NOT NULL,
    max_audio_input_seconds INTEGER,
    max_audio_output_seconds INTEGER,
    allow_voice_profile BOOLEAN NOT NULL DEFAULT FALSE,
    allow_transcript_history BOOLEAN NOT NULL DEFAULT TRUE,
    allow_interview_mode BOOLEAN NOT NULL DEFAULT FALSE,
    allow_export BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    expired_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata_json JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 17. Seed Data

Initial plans:

```sql
INSERT INTO plans (
    name,
    monthly_price,
    max_minutes_per_month,
    max_audio_input_seconds,
    max_audio_output_seconds,
    allow_voice_profile,
    allow_transcript_history,
    allow_interview_mode,
    allow_export
) VALUES
('Free', 0, 30, 1800, 1800, FALSE, TRUE, FALSE, FALSE),
('Pro', 0, 500, 30000, 30000, TRUE, TRUE, TRUE, TRUE),
('Business', 0, 3000, 180000, 180000, TRUE, TRUE, TRUE, TRUE);
```

Harga final belum ditentukan karena harus dihitung berdasarkan biaya provider STT, translation, TTS, dan voice cloning.

---

## 18. Migration Rules

Aturan migrasi:

1. Gunakan Alembic untuk semua perubahan schema backend.
2. Jangan edit database production manual tanpa migration.
3. Setiap perubahan schema harus update `database.md`.
4. Migration harus bisa rollback jika memungkinkan.
5. Jangan drop kolom/tabel tanpa backup dan persetujuan.
6. Jangan mengubah tipe kolom besar tanpa rencana migrasi data.
7. Tambahkan index jika query mulai lambat.

---

## 19. Query Penting

### Usage bulanan user

```sql
SELECT
    user_id,
    SUM(audio_input_seconds) AS total_input_seconds,
    SUM(audio_output_seconds) AS total_output_seconds,
    SUM(estimated_total_cost) AS estimated_total_cost
FROM usage_logs
WHERE user_id = :user_id
  AND created_at >= date_trunc('month', NOW())
GROUP BY user_id;
```

### Transcript by session

```sql
SELECT *
FROM transcripts
WHERE session_id = :session_id
  AND user_id = :user_id
ORDER BY sequence_number ASC, created_at ASC;
```

### Active subscription

```sql
SELECT s.*, p.name AS plan_name
FROM subscriptions s
JOIN plans p ON p.id = s.plan_id
WHERE s.user_id = :user_id
  AND s.status IN ('active', 'trial')
ORDER BY s.created_at DESC
LIMIT 1;
```

---

## 20. Database Checklist Sebelum Beta

- [ ] Semua tabel utama sudah dibuat melalui Alembic.
- [ ] Password tidak plain text.
- [ ] Foreign key sudah benar.
- [ ] Index user_id tersedia di tabel user-owned.
- [ ] Usage bisa dihitung per bulan.
- [ ] Transcript hanya bisa diakses pemiliknya.
- [ ] Voice profile punya consent recording.
- [ ] Soft delete tersedia untuk voice profile.
- [ ] Audit log mencatat aksi penting.
- [ ] Seed plan awal tersedia.
- [ ] Backup database tersedia sebelum user beta.
