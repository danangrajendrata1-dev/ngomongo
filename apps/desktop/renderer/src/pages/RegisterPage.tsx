import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { RegisterPayload } from '@/types/auth';

type RegisterPageProps = {
  isLoading: boolean;
  error: string | null;
  onRegister: (payload: RegisterPayload) => Promise<void>;
  onGoToLogin: () => void;
  onClearError: () => void;
};

export function RegisterPage({ isLoading, error, onRegister, onGoToLogin, onClearError }: RegisterPageProps) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearError();
    setLocalError(null);

    if (form.password !== confirmPassword) {
      setLocalError('Password dan konfirmasi password harus sama.');
      return;
    }

    try {
      await onRegister(form);
    } catch {
      // Error sudah ditangani oleh auth store dan ditampilkan di UI.
    }
  };

  return (
    <div className="auth-shell">
      <Card
        title="Buat akun NGOMONGO"
        description="Registrasi diarahkan ke backend FastAPI."
        className="auth-card"
      >
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label className="field-group">
            <span className="field-group__label">Nama</span>
            <input
              className="field"
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </label>

          <label className="field-group">
            <span className="field-group__label">Email</span>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>

          <label className="field-group">
            <span className="field-group__label">Password</span>
            <input
              className="field"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="field-group">
            <span className="field-group__label">Confirm Password</span>
            <input
              className="field"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {localError ? <p className="text-danger">{localError}</p> : null}
          {error ? <p className="text-danger">{error}</p> : null}

          <div className="control-row">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftar...' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onGoToLogin}
              disabled={isLoading}
            >
              Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
