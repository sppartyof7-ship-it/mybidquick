import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { signIn, resetPassword } from '../lib/db'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [mode, setMode] = useState('login') // 'login' or 'reset'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
      if (err.message?.includes('Invalid login')) {
        setError('Wrong email or password. Please try again.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account first.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      setError('Could not send reset email. Please check the address.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: 12,
    border: '2px solid #e2e8f0',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 50%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        background: 'white',
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
          }}>BQ</div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>MyBidQuick</span>
        </div>
        <div
          style={{ fontSize: 13, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/signup')}
        >
          Don't have an account? Sign up
        </div>
      </div>

      {/* Login card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 22,
            }}>BQ</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '8px 0 0' }}>
              {mode === 'login'
                ? 'Log in to your MyBidQuick dashboard'
                : 'Enter your email and we\'ll send a reset link'}
            </p>
          </div>

          {resetSent ? (
            <div style={{
              padding: 20,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{'\u{1F4E7}'}</div>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>Check your email!</div>
              <div style={{ fontSize: 13, color: '#15803d' }}>
                We sent a password reset link to <strong>{email}</strong>
              </div>
              <button
                onClick={() => { setMode('login'); setResetSent(false); setError('') }}
                style={{
                  marginTop: 16, padding: '10px 24px', borderRadius: 10,
                  background: '#2563eb', color: 'white', border: 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: 14,
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleReset}>
              {/* Email */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Mail size={18} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password (only in login mode) */}
              {mode === 'login' && (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Lock size={18} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#94a3b8',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {/* Forgot password link */}
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                  <span
                    onClick={() => { setMode('reset'); setError('') }}
                    style={{ fontSize: 13, color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: 13, marginBottom: 16,
                  fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !email || (mode === 'login' && !password)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {loading
                  ? (mode === 'login' ? 'Logging in...' : 'Sending...')
                  : (mode === 'login' ? 'Log In' : 'Send Reset Link')}
                {!loading && <ArrowRight size={18} />}
              </button>

              {/* Toggle mode */}
              {mode === 'reset' && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <span
                    onClick={() => { setMode('login'); setError('') }}
                    style={{ fontSize: 13, color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Back to login
                  </span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
      }}>
        Proudly made in Wisconsin
      </div>
    </div>
  )
}
