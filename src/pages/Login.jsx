import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    else nav('/admin')
  }

  return (
    <div className="auth">
      <div className="box">
        <img src="/logo-gold.png" alt="Fast Lane Media" />
        <h1>Studio Login</h1>
        <form onSubmit={submit}>
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="msg">{error}</div>}
          <button className="btn solid" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}
