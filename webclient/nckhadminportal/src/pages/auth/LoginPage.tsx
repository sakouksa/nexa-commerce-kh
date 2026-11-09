import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils';
import { FiEye, FiEyeOff, FiLock, FiMoon, FiSun } from 'react-icons/fi';
import { login } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitcher } from '../../i18n';
import { MiniStoreLogo, MorphingSquare } from '../../components/common';

const MAX_FAILED = 3;
const BASE_LOCK_MIN = 5;

const fmt = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};


export default function LoginPage() {
  const { user, setAuth } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: localStorage.getItem('remember_username') || '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem('remember_username'))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEnteringDashboard, setIsEnteringDashboard] = useState(false);
  const [failed, setFailed] = useState(0);
  const [lockLevel, setLockLevel] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      setIsEnteringDashboard(true);
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (!lockUntil) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [lockUntil]);

  const lockRemaining = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0;
  const locked = lockRemaining > 0;
  const attemptsLeft = Math.max(0, MAX_FAILED - failed);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const fillQuickLogin = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setForm({ username: 'demo', password: 'password' });
      toast.success('Filled Demo User credentials', { icon: '✨' });
    } else {
      setForm({ username: 'admin', password: 'password' });
      toast.success('Filled Admin credentials', { icon: '🔑' });
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast('Forgot password? Please contact administrator via Telegram @your_telegram', {
      icon: '💬',
    });
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    if (!form.username.trim() || !form.password) {
      toast.error(t('toast.enterCredentials', 'Please enter email or username and password'));
      return;
    }

    setLoading(true);
    try {
      const data = await login({
        username: form.username.trim(),
        password: form.password,
      });

      if (data.user.role !== 'admin' && data.user.role !== 'superadmin') {
        toast.error('This panel is for administrators only');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('remember_username', form.username.trim());
      } else {
        localStorage.removeItem('remember_username');
      }

      setAuth(data.access_token, data.user);
      toast.success(t('auth.welcomeBack', { username: data.user.username }));
      setIsEnteringDashboard(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1400);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || 'Login failed';

      if (status === 429) {
        const m = detail.match(/(\d+) min/);
        const s = detail.match(/(\d+) sec/);
        let wait = BASE_LOCK_MIN * 60;
        if (m) wait = parseInt(m[1], 10) * 60;
        if (s) wait += parseInt(s[1], 10);
        setLockUntil(Date.now() + wait * 1000);
        setNow(Date.now());
        setFailed(0);
        toast.error(detail);
      } else if (status === 401) {
        const next = failed + 1;
        setFailed(next);
        if (next >= MAX_FAILED) {
          const level = lockLevel + 1;
          setLockLevel(level);
          const mins = BASE_LOCK_MIN * level;
          setLockUntil(Date.now() + mins * 60000);
          setNow(Date.now());
          setFailed(0);
          toast.error(`Too many failed attempts. Account locked for ${mins} minutes.`);
        } else {
          toast.error(detail);
        }
      } else {
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Decorative concentric dashed background pattern */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <svg
          width="686"
          height="671"
          viewBox="0 0 686 671"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[686px] h-[671px] max-w-none text-sky-600 dark:text-sky-500 opacity-60 dark:opacity-20"
        >
          {/* Tilted pill highlight */}
          <path
            d="M442.137 102.265C482.171 64.0112 545.636 65.454 583.89 105.488C622.145 145.522 620.702 208.987 580.668 247.242L242.62 570.26C202.586 608.514 139.121 607.071 100.867 567.037C62.6126 527.003 64.0555 463.538 104.09 425.283L442.137 102.265Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <path
            d="M583.529 105.834C621.592 145.668 620.157 208.817 580.322 246.88L242.275 569.898C202.44 607.962 139.292 606.526 101.228 566.691C63.1649 526.857 64.6005 463.708 104.435 425.645L442.482 102.627C482.317 64.5634 545.465 65.9991 583.529 105.834Z"
            stroke="currentColor"
            strokeOpacity="0.16"
          />
          {/* Concentric dashed circles */}
          <circle
            cx="343"
            cy="335"
            r="280"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeDasharray="8 8"
          />
          <circle
            cx="343"
            cy="335"
            r="210"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeDasharray="6 6"
          />
          <circle
            cx="343"
            cy="335"
            r="140"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* Language & Theme Controls (Top Right) */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2.5">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs"
        >
          {isDark ? <FiSun className="size-4 text-amber-400" /> : <FiMoon className="size-4" />}
        </button>
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full sm:max-w-lg rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 transition-all">
        {/* Brand Header */}
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-2.5 mb-6 outline-none group">
            <MiniStoreLogo size="md" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                MiniStore KH
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                Admin
              </span>
            </div>
          </a>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-1.5">
              {t('auth.loginTitle') || 'Sign in to Platform Admin'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {t('auth.loginSubtitle') || 'Enter your Username and Password to continue.'}
            </p>
          </div>
        </div>

        {/* Lockout or Warning Messages */}
        {locked && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-3 text-center">
            <FiLock className="inline text-red-500 mr-1.5" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {t('auth.accountLocked') || 'Account locked'}
            </span>
            <p className="text-xs text-red-500 mt-1 font-mono">
              {t('auth.lockedWait', { time: fmt(lockRemaining) }) || `Try again in ${fmt(lockRemaining)}`}
            </p>
          </div>
        )}

        {!locked && attemptsLeft < MAX_FAILED && (
          <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
            {t('auth.attemptsRemaining', { count: attemptsLeft }) || `⚠️ ${attemptsLeft} attempt(s) left before account is locked`}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Email address / Username Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
              {t('auth.usernameOrEmail') || 'Username or Email'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={locked}
              placeholder={t('auth.usernamePlaceholder') || 'admin'}
              autoFocus
              className="h-10 w-full min-w-0 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-3 focus:ring-sky-500/20 dark:bg-slate-800/30 dark:text-white disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
              {t('auth.password') || 'Password'} <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={locked}
                placeholder={t('auth.passwordPlaceholder') || '••••••••'}
                className="h-10 w-full min-w-0 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent pl-2.5 pr-9 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-3 focus:ring-sky-500/20 dark:bg-slate-800/30 dark:text-white disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between gap-y-2 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500 dark:bg-slate-800/40"
              />
              <span>{t('auth.rememberMe') || 'Remember Me'}</span>
            </label>
            <a
              href="#forgot-password"
              onClick={handleForgotPassword}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              {t('auth.forgotPassword') || 'Forgot Password?'}
            </a>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || locked}
            className="w-full h-10 rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('auth.signingIn') || 'Signing in...'}
              </span>
            ) : locked ? (
              `${t('auth.accountLocked') || 'Locked'} (${fmt(lockRemaining)})`
            ) : (
              t('auth.signIn') || 'Sign in to Platform Admin'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 select-none">
            &copy; {new Date().getFullYear()} MiniStore KH &mdash; Platform Admin Portal
          </p>
        </div>

      </div>

      {/* MorphingSquare Loading Screen before entering Dashboard (Clean, no box) */}
      {isEnteringDashboard && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
          <MorphingSquare
            className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 shadow-xl shadow-indigo-500/30"
            message={
              isKhmer
                ? 'កំពុងផ្ទៀងផ្ទាត់ និងរៀបចំផ្ទាំងគ្រប់គ្រង...'
                : 'Authenticating & preparing dashboard...'
            }
            messagePlacement="bottom"
          />
        </div>
      )}

    </div>
  );
}
