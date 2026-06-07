import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LoginPayload } from '@/types/auth';

type LoginPageProps = {
  isLoading: boolean;
  error: string | null;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onGoToRegister: () => void;
  onClearError: () => void;
};

export function LoginPage({ isLoading, error, onLogin, onGoToRegister, onClearError }: LoginPageProps) {
  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearError();
    try {
      await onLogin(form);
    } catch {
      // Error sudah ditangani oleh auth store dan ditampilkan di UI.
    }
  };

  return (
    <div className="auth-shell">
      <Card
        title="Masuk ke NGOMONGO"
        description="Gunakan akun backend untuk sinkronisasi desktop dan device settings."
        className="auth-card"
      >
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
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
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-danger">{error}</p> : null}

          <div className="control-row">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sedang masuk...' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onGoToRegister}
              disabled={isLoading}
            >
              Register
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
