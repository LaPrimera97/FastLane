import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Particles from '../components/Particles.jsx'
import Social from '../components/Social.jsx'

const EMAIL = 'naftalie22@gmail.com'
const PHONE = '0715234408'
const ACCESS_KEY = 'PASTE_YOUR_KEY_HERE'
const SUPERAPP_LINK = ''
const BKS_LINK = 'https://bkscommunityjobcenter.com'
const VIEWS = ['services', 'work', 'story', 'contact']
const MENU = [
  ['home', 'Home'],
  ['services', 'Services'],
  ['work', 'Our Work'],
  ['story', 'Our Story'],
  ['contact', 'Contact'],
]

export default function Home() {
  const [media, setMedia] = useState([])
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name: '', email: '', service: 'Photography', message: '' })
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const apply = (scroll) => {
      const h = window.location.hash.replace('#', '')
      document.documentElement.dataset.view = VIEWS.includes(h) ? h : 'home'
      if (scroll && window.matchMedia('(max-width:860px)').matches) window.scrollTo(0, 0)
    }
    apply(false)
    const onHash = () => apply(true)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    supabase
      .from('media')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMedia(data || []))
  }, [])

  const categories = ['All', ...new Set(media.map((m) => m.category))]
  const shown = filter === 'All' ? media : media.filter((m) => m.category === filter)

  const send = async (e) => {
    e.preventDefault()
    setStatus('sending')
    if (ACCESS_KEY.startsWith('PASTE')) {
      const text = 'Name: ' + form.name + '\nEmail: ' + form.email + '\nService: ' + form.service + '\n\n' + form.message
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + form.name) + '&body=' + encodeURIComponent(text)
      setStatus('idle')
      return
    }
    const data = new FormData(e.target)
    data.append('access_key', ACCESS_KEY)
    data.append('subject', 'New enquiry from the Fast Lane Media website')
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      const j = await r.json()
      if (!j.success) throw new Error('failed')
      setStatus('sent')
      setForm({ name: '', email: '', service: 'Photography', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const go = () => {
    setOpen(false)
    window.scrollTo(0, 0)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <Particles />
      <nav>
        <div className="wrap">
          <a href="#top"><img src="/logo-white.png" alt="Fast Lane Media" /></a>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#work">Our Work</a></li>
            <li><a href="#story">Story</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <a className="btn" href="#contact">Book Us</a>
          <button className={'hamburger' + (open ? ' open' : '')} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={'mobile-menu' + (open ? ' open' : '')} aria-hidden={!open}>
        {MENU.map(([id, label]) => (
          <a key={id} href={'#' + id} onClick={go}>{label}</a>
        ))}
        <a className="mobile-cta" href="#contact" onClick={go}>Book Us</a>
        <Social center />
      </div>

      <header className="hero" id="top">
        <div className="wrap">
          <div>
            <div className="eyebrow">Photography &amp; Videography</div>
            <h1>Every moment has a <em>story</em> worth preserving.</h1>
            <p>We capture genuine connections, emotions and memories you&rsquo;ll cherish forever.</p>
            <div className="cta">
              <a className="btn solid" href="#contact">Inbox Us Today</a>
              <a className="btn" href="#work">View Our Work</a>
            </div>
          </div>
          <div className="mark"><img src="/logo-gold.png" alt="" /></div>
        </div>
      </header>

      <div className="strip">
        <div>
          {[0, 1].map((i) => (
            <span key={i} style={{ margin: 0, color: 'inherit' }}>
              Weddings<span>&#9670;</span>Portraits<span>&#9670;</span>Events<span>&#9670;</span>Brand Films<span>&#9670;</span>Celebrations<span>&#9670;</span>Websites<span>&#9670;</span>Web Applications<span>&#9670;</span>Mobile Apps<span>&#9670;</span>
            </span>
          ))}
        </div>
      </div>

      <section id="services">
        <div className="wrap">
          <div className="head">
            <div className="eyebrow">What We Do</div>
            <h2>Three services. One standard of excellence.</h2>
          </div>
          <div className="services">
            <div className="card">
              <span className="n">01</span>
              <h3>Photography</h3>
              <p>Timeless imagery that holds the feeling of the day, not just the faces in it.</p>
              <ul>
                <li>Weddings &amp; engagements</li>
                <li>Portraits &amp; family sessions</li>
                <li>Events &amp; corporate coverage</li>
              </ul>
            </div>
            <div className="card">
              <span className="n">02</span>
              <h3>Videography</h3>
              <p>Cinematic storytelling that lets you relive every laugh, tear and heartbeat.</p>
              <ul>
                <li>Highlight films</li>
                <li>Event &amp; ceremony coverage</li>
                <li>Brand &amp; promotional video</li>
              </ul>
            </div>
            <div className="card">
              <span className="n">03</span>
              <h3>Websites &amp; Apps</h3>
              <p>Digital products built around your business, from a simple online presence to a custom platform.</p>
              <ul>
                <li>Business websites</li>
                <li>Web applications</li>
                <li>Mobile apps</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="work" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head">
            <div className="eyebrow">Our Work</div>
            <h2>Moments, framed.</h2>
          </div>
          {media.length > 0 && (
            <div className="filters">
              {categories.map((c) => (
                <button key={c} className={'chip' + (filter === c ? ' on' : '')} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <div className="empty">Our latest work is coming soon.</div>
          ) : (
            <div className="gallery">
              {shown.map((m) => (
                <figure key={m.id}>
                  {m.type === 'video' ? (
                    /youtube-nocookie\.com|player\.vimeo\.com/.test(m.file_url) ? <div className="embed"><iframe src={m.file_url} title={m.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen></iframe></div> : <video src={m.file_url} controls preload="metadata" playsInline />
                  ) : (
                    <img src={m.file_url} alt={m.title} loading="lazy" />
                  )}
                  {m.type === 'photo' && <figcaption>{m.category}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          <div className="apps">
            <div className="head">
              <div className="eyebrow">Websites &amp; Apps</div>
              <h2>Built by us, live today.</h2>
            </div>
            <div className="projects">
              <a className="proj" href={BKS_LINK} target="_blank" rel="noopener noreferrer">
                <div className="pl"><span>BKS</span><img src="/projects/bks.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div>
                  <h4>BKS Community Job Center</h4>
                  <p>A bilingual recruitment platform built to connect mine host communities with local jobs.</p>
                  <span className="go">Visit site &rarr;</span>
                </div>
              </a>
              <a className="proj" href={SUPERAPP_LINK || '#contact'} {...(SUPERAPP_LINK ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <div className="pl"><span>SA</span><img src="/projects/superapp.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div>
                  <h4>SuperApp</h4>
                  <p>A branded mobile app that lets clubs and brands own their community, with posts, reels, chat and events.</p>
                  <span className="go">{SUPERAPP_LINK ? 'Install on Android \u2192' : 'Coming soon \u00b7 Request a demo \u2192'}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="wrap">
          <blockquote>Don&rsquo;t hesitate and be late. <b>Your moment only happens once.</b></blockquote>
          <p>Fast Lane Media is rooted in Atok, Ga-Selepe, and built on one belief: genuine connection makes the best photographs.</p>
        </div>
      </section>

      <section id="contact">
        <div className="wrap contact">
          <div className="info">
            <div className="eyebrow">Get In Touch</div>
            <h2 style={{ fontSize: 'clamp(34px,5vw,52px)' }}>Let&rsquo;s capture yours.</h2>
            <p><b>Phone</b><a href={'tel:' + PHONE}>071 523 4408</a></p>
            <p><b>Email</b><a href={'mailto:' + EMAIL}>{EMAIL}</a></p>
            <p><b>Studio</b>Atok, Ga-Selepe, Boselakgaka Section, 0749</p>
            <Social />
          </div>
          <form onSubmit={send}>
            <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input required name="name" placeholder="Your name" value={form.name} onChange={set('name')} />
            <input required name="email" type="email" placeholder="Email address" value={form.email} onChange={set('email')} />
            <select name="service" value={form.service} onChange={set('service')}>
              <option>Photography</option>
              <option>Videography</option>
              <option>Both</option>
              <option>Websites &amp; Apps</option>
            </select>
            <textarea required name="message" placeholder="Tell us about your moment" value={form.message} onChange={set('message')} />
            <button className="btn solid" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send Enquiry'}</button>
            {status === 'sent' && <p className="ok">Thank you. Your enquiry has been sent and we will get back to you soon.</p>}
            {status === 'error' && <p className="msg">Something went wrong. Please try again or reach us on WhatsApp or phone.</p>}
          </form>
        </div>
      </section>

      <footer>
        <img src="/logo-white.png" alt="Fast Lane Media" />
        <p>Every moment has a story worth preserving.</p>
        <Social center />
        <p style={{ marginTop: 8 }}>&copy; {new Date().getFullYear()} Fast Lane Media. All rights reserved. <Link to="/admin" style={{ opacity: 0.4 }}>Admin</Link></p>
      </footer>
    </>
  )
}
