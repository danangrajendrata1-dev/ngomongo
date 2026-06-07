import { useEffect, useMemo, useRef, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { APP_NAME, type AppPageId } from '@/lib/constants';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DeviceSetupPage } from '@/pages/DeviceSetupPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsagePage } from '@/pages/UsagePage';
import { VoiceProfilePage } from '@/pages/VoiceProfilePage';
import { VoiceTranslatePage } from '@/pages/VoiceTranslatePage';
import { useAuth } from '@/stores/authStore';
import { bootstrapDesktopSession } from '@/services/desktop.service';

type AuthView = 'login' | 'register';

const PAGE_META: Record<AppPageId, { title: string; description: string }> = {
  dashboard: {
    title: APP_NAME,
    description: 'Ringkasan desktop foundation dan akses cepat ke halaman utama.',
  },
  'voice-translate': {
    title: 'Voice Translate',
    description: 'Fondasi antarmuka untuk sesi translate realtime.',
  },
  'device-setup': {
    title: 'Device Setup',
    description: 'Pilih microphone dan output device yang akan dipakai.',
  },
  'voice-profile': {
    title: 'Voice Profile',
    description: 'Placeholder consent dan profil suara.',
  },
  history: {
    title: 'History',
    description: 'Placeholder riwayat transcript dan sesi.',
  },
  usage: {
    title: 'Usage & Plan',
    description: 'Placeholder pemakaian, quota, dan billing.',
  },
  settings: {
    title: 'Settings',
    description: 'Preferensi aplikasi yang disimpan lokal.',
  },
};

export function App() {
  const auth = useAuth();
  const [activePage, setActivePage] = useState<AppPageId>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const bootstrappedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setActivePage('dashboard');
      return;
    }

    setActivePage('dashboard');
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token || bootstrappedTokenRef.current === auth.token) {
      return;
    }

    bootstrappedTokenRef.current = auth.token;

    void bootstrapDesktopSession(auth.token).catch(() => {
      // Desktop bootstrap boleh gagal tanpa memblokir login.
    });
  }, [auth.isAuthenticated, auth.token]);

  const pageMeta = useMemo(() => PAGE_META[activePage], [activePage]);

  if (auth.isBootstrapping) {
    return (
      <div className="auth-shell">
        <div className="auth-loading">
          <span className="status-pill status-pill--warning">Memuat sesi...</span>
          <h1>NGOMONGO</h1>
          <p className="text-muted">Mengecek token tersimpan dan menyiapkan workspace desktop.</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage
        isLoading={auth.isLoading}
        error={auth.error}
        onLogin={auth.login}
        onGoToRegister={() => {
          auth.clearError();
          setAuthView('register');
        }}
        onClearError={auth.clearError}
      />
    ) : (
      <RegisterPage
        isLoading={auth.isLoading}
        error={auth.error}
        onRegister={auth.register}
        onGoToLogin={() => {
          auth.clearError();
          setAuthView('login');
        }}
        onClearError={auth.clearError}
      />
    );
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      title={pageMeta.title}
      description={pageMeta.description}
      statusLabel={auth.isAuthenticated ? 'Tersambung' : 'Local foundation'}
      userName={auth.user?.name}
      onLogout={async () => {
        await auth.logout();
        setAuthView('login');
        setActivePage('dashboard');
        bootstrappedTokenRef.current = null;
      }}
    >
      {activePage === 'dashboard' ? <DashboardPage onOpenVoiceTranslate={() => setActivePage('voice-translate')} /> : null}
      {activePage === 'voice-translate' ? <VoiceTranslatePage /> : null}
      {activePage === 'device-setup' ? <DeviceSetupPage /> : null}
      {activePage === 'voice-profile' ? <VoiceProfilePage /> : null}
      {activePage === 'history' ? <HistoryPage /> : null}
      {activePage === 'usage' ? <UsagePage /> : null}
      {activePage === 'settings' ? <SettingsPage /> : null}
    </AppLayout>
  );
}
