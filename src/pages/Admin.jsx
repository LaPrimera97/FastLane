import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { resumableUpload } from '../lib/resumableUpload'
import { compressImage } from '../lib/compressImage'

const MAX_MB = 50
const CATEGORIES = ['Weddings', 'Portraits', 'Family', 'Events', 'Brand Films', 'Other']
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']

const toEmbed = (url) => {
  const u = url.trim()
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1]
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (m) return 'https://player.vimeo.com/video/' + m[1]
  return null
}

export default function Admin() {
  const nav = useNavigate()
  const [ready, setReady] = useState(false)
  const [items, setItems] = useState([])
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [link, setLink] = useState('')
  const [linkTitle, setLinkTitle] = useState('')

  const load = async () => {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false })
    if (error) setStatus('Could not load your media: ' + error.message)
    else setItems(data || [])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav('/admin/login')
      else {
        setReady(true)
        load()
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') nav('/admin/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [nav])

  useEffect(() => {
    if (!busy) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy])

  const upload = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    const notes = []
    let done = 0
    for (const [i, original] of files.entries()) {
      const label = 'Uploading ' + (i + 1) + ' of ' + files.length + ': ' + original.name
      if (!ALLOWED.includes(original.type)) {
        notes.push(original.name + ' is not a supported file type and was skipped')
        continue
      }
      setStatus(label)
      const file = original.type.startsWith('image/') ? await compressImage(original) : original
      if (file.size > MAX_MB * 1024 * 1024) {
        notes.push(original.name + ' is over ' + MAX_MB + ' MB and was skipped. For long videos, use a YouTube or Vimeo link instead')
        continue
      }
      const type = file.type.startsWith('video') ? 'video' : 'photo'
      const path = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      let failed = ''
      try {
        await resumableUpload('media', path, file, (p) => setStatus(label + ' (' + p + '%)'))
      } catch (err) {
        failed = err.message || 'Upload failed. Check your connection and try again.'
      }
      if (failed) {
        notes.push(original.name + ': ' + failed)
        continue
      }
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      const ins = await supabase.from('media').insert({
        title: file.name.replace(/\.[^.]+$/, ''),
        category,
        type,
        file_path: path,
        file_url: data.publicUrl,
      })
      if (ins.error) {
        await supabase.storage.from('media').remove([path])
        notes.push(original.name + ': ' + ins.error.message)
      } else done++
    }
    setBusy(false)
    setStatus(done + ' uploaded.' + (notes.length ? ' ' + notes.join(' | ') : ''))
    load()
  }

  const addLink = async () => {
    const embed = toEmbed(link)
    if (!embed) {
      setStatus('That does not look like a YouTube or Vimeo link.')
      return
    }
    setBusy(true)
    const ins = await supabase.from('media').insert({
      title: linkTitle.trim() || 'Video',
      category,
      type: 'video',
      file_path: '',
      file_url: embed,
    })
    setBusy(false)
    if (ins.error) setStatus(ins.error.message)
    else {
      setStatus('Video link added.')
      setLink('')
      setLinkTitle('')
    }
    load()
  }

  const toggle = async (m) => {
    const { error } = await supabase.from('media').update({ published: !m.published }).eq('id', m.id)
    if (error) setStatus('Could not update: ' + error.message)
    load()
  }

  const remove = async (m) => {
    if (!window.confirm('Delete ' + m.title + '? This cannot be undone.')) return
    if (m.file_path) {
      const rm = await supabase.storage.from('media').remove([m.file_path])
      if (rm.error) {
        setStatus('Could not delete the file: ' + rm.error.message)
        return
      }
    }
    const del = await supabase.from('media').delete().eq('id', m.id)
    if (del.error) setStatus('Could not delete: ' + del.error.message)
    load()
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    nav('/admin/login')
  }

  if (!ready) return null

  return (
    <div className="dash">
      <div className="wrap">
        <header>
          <h1>Studio Dashboard</h1>
          <div className="cta">
            <Link className="btn" to="/">View Site</Link>
            <button className="btn" onClick={signOut}>Sign Out</button>
          </div>
        </header>

        <div className="drop">
          <h3 style={{ fontSize: 26, color: 'var(--gold)' }}>Upload photos and videos</h3>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="btn solid" style={{ opacity: busy ? 0.5 : 1 }}>
            {busy ? 'Uploading...' : 'Choose files'}
            <input type="file" accept="image/*,video/*" multiple hidden disabled={busy} onChange={upload} />
          </label>
          <small>Maximum {MAX_MB} MB per file. Photos are resized automatically.</small>
        </div>
        <div className="drop">
          <h3 style={{ fontSize: 26, color: 'var(--gold)' }}>Add a YouTube or Vimeo video</h3>
          <input placeholder="Paste the video link" value={link} onChange={(e) => setLink(e.target.value)} style={{ maxWidth: 420 }} />
          <input placeholder="Title (optional)" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} style={{ maxWidth: 420 }} />
          <button className="btn solid" disabled={busy || !link.trim()} onClick={addLink}>Add video link</button>
          <small>Uses the category chosen above</small>
        </div>
        {status && <div className="ok">{status}</div>}

        <div className="list">
          {items.map((m) => (
            <div className="item" key={m.id}>
              {m.type === 'video' ? <div className="th">{m.file_path ? 'VIDEO' : 'LINK'}</div> : <img src={m.file_url} alt="" loading="lazy" />}
              <div>
                {m.title}
                <small>{m.category} &middot; {m.type === 'video' && !m.file_path ? 'video link' : m.type} &middot; {m.published ? 'Published' : 'Hidden'}</small>
              </div>
              <div className="acts">
                <button className="btn" onClick={() => toggle(m)}>{m.published ? 'Hide' : 'Publish'}</button>
                <button className="btn" onClick={() => remove(m)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="empty">Nothing uploaded yet.</div>}
        </div>
      </div>
    </div>
  )
}
