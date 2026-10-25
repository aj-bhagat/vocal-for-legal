import { FormEvent, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080').replace(/\/$/, '');

const practices = [
  { icon: '⌂', title: 'Property & Real Estate', text: 'General information about property documents, ownership questions, and transaction considerations.' },
  { icon: '▤', title: 'Contracts & Agreements', text: 'Common agreement types, essential clauses, and questions to clarify before signing.' },
  { icon: '♡', title: 'Family & Matrimonial', text: 'Introductory information about family-related legal processes and documentation.' },
  { icon: '▥', title: 'Business & Corporate', text: 'Foundational information on business documents, contracts, and compliance topics.' },
  { icon: '§', title: 'Legal Notices & Disputes', text: 'The general purpose of notices, timelines, and why case-specific advice matters.' },
  { icon: '◉', title: 'Consumer & Everyday Rights', text: 'Consumer concerns, everyday rights, and how to prepare before seeking help.' }
];

const articles = [
  { tag: 'PROPERTY', title: 'What should you review before signing a rental agreement?', text: 'A plain-language checklist of common clauses, deposits, responsibilities, and questions worth clarifying.' },
  { tag: 'DOCUMENTS', title: 'What is a legal notice, and what does it usually mean?', text: 'Understand the general purpose of a notice, what to check, and when a response may need advice.' },
  { tag: 'CONSUMER', title: 'How to prepare for a consumer complaint', text: 'Organise your documents, record key dates, and identify the outcome you are seeking.' }
];

type ModalContent = { title: string; paragraphs: string[] };
const modalContent: Record<string, ModalContent> = {
  disclaimer: { title: 'Important legal notice', paragraphs: [
    'Material on Vocal for Legal is intended for general educational and informational purposes. It is not legal advice and should not be relied upon for a particular matter. Laws, procedures, and outcomes depend on facts and jurisdiction.',
    'Review urgent matters and deadlines with a qualified advocate promptly. Submitting a form or browsing this website does not create an advocate–client relationship. No outcome, result, or timeline is promised.',
    'This wording is a placeholder and should be reviewed by an Indian legal professional before launch.'
  ]},
  privacy: { title: 'Privacy overview', paragraphs: [
    'Before production, publish a privacy notice that identifies the data controller, purposes of processing, recipients, retention, security measures, user rights, grievance contact, and consent/withdrawal process where applicable.',
    'Collect only what is necessary. Avoid requesting confidential case documents or sensitive personal details through an ordinary contact form. Obtain professional review of applicable Indian data-protection requirements.'
  ]},
  terms: { title: 'Terms of use', paragraphs: [
    'Use this website for general information only. Do not treat articles as a legal opinion or as instructions for a specific case. Content may be incomplete or out of date.',
    'Production terms should identify the website operator, explain content ownership and acceptable use, and be reviewed for enforceability and applicable Indian law.'
  ]},
  rental: { title: 'Rental agreement: points to review', paragraphs: [
    'A rental agreement commonly records the parties, premises, term, rent, deposit, maintenance obligations, notice requirements, and conditions for ending the arrangement. Check that the written terms reflect what was agreed and clarify ambiguous charges or responsibilities.',
    'Registration, stamping, and local requirements can vary. This is illustrative information, not legal advice. Have the document reviewed for your circumstances when needed.'
  ]},
  notice: { title: 'What is a legal notice?', paragraphs: [
    'A legal notice is a formal communication that may set out a grievance, demand, or proposed action. Its legal effect depends on the subject, governing law, wording, method of service, and facts.',
    'Keep the notice and proof of receipt, note any stated dates, and consult a qualified advocate promptly if the matter is significant or time-sensitive. Do not rely on this summary to calculate a deadline.'
  ]},
  consumer: { title: 'Preparing for a consumer complaint', paragraphs: [
    'Organise purchase records, invoices, order confirmations, correspondence, warranty terms, complaint reference numbers, and a timeline of events. Write down the outcome you are seeking and retain copies.',
    'Available forums, eligibility, limitation periods, and procedures depend on the facts and applicable law. Confirm the correct route and deadlines with an official source or qualified professional.'
  ]}
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', topic: '', message: '', consent: false });

  const update = (key: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    if (!form.fullName.trim() || !form.email.trim() || !form.topic || !form.consent) {
      setStatus({ kind: 'error', text: 'Please complete your name, email, area of interest, and acknowledgement.' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          topic: form.topic,
          message: form.message.trim() || null,
          consent: form.consent
        })
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || 'The enquiry could not be sent. Please try again later or contact the advocate through a verified channel.');
      }
      setStatus({ kind: 'success', text: 'Your enquiry was submitted. This does not create an advocate–client relationship; the advocate must separately confirm whether instructions can be accepted.' });
      setForm({ fullName: '', email: '', phone: '', topic: '', message: '', consent: false });
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to contact the server. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  const closeMenu = () => setMenuOpen(false);
  const modal = modalKey ? modalContent[modalKey] : null;

  return (
    <>
      <div className="topline"><div className="container topline-inner"><span>Independent legal practice · Maharashtra</span><span>Professional enquiry: <a href="#contact">Contact the advocate ↗</a></span></div></div>
      <header>
        <div className="container nav">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="Vocal for Legal home">
            <span className="brand-mark">⚖</span>
            <span><span className="brand-name">Vocal for Legal</span><span className="brand-tag">Law · Explained · Understood</span></span>
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-label="Toggle navigation">☰</button>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
            {['Home', 'Legal Services', 'About', 'Legal Insights', 'Contact'].map((label, i) => <a key={label} href={['#home', '#services', '#about', '#insights', '#contact'][i]} onClick={closeMenu}>{label}</a>)}
          </nav>
          <a className="btn btn-primary nav-cta" href="#contact">Make an enquiry <span>↗</span></a>
        </div>
      </header>
      <main>
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">Legal information across Maharashtra</div>
              <h1>Experienced counsel.<br /><em>Clear guidance.</em></h1>
              <p className="hero-copy">Advocate [Full Name] offers legal services with a focus on clear communication, careful preparation, and practical guidance. Explore verified areas of practice and contact the advocate to enquire about your matter.</p>
              <div className="hero-actions"><a className="btn btn-primary" href="#contact">Contact the advocate <span>↗</span></a><a className="btn btn-outline" href="#services">Areas of practice</a></div>
              <div className="hero-note"><span className="note-icon">✓</span><span>Clear information. Respectful communication.<br />Professional guidance where appropriate.</span></div>
            </div>
            <div className="hero-art" aria-label="Decorative legal illustration">
              <div className="art-halo" />
              <div className="floating-card float-one"><span className="float-icon">▤</span><span><strong>Understand your options</strong><small>Information, made accessible</small></span></div>
              <div className="art-panel"><div className="art-top">Advocacy · Preparation · Integrity</div><div className="art-orbit">⚖</div><div className="art-columns"><i /><i /><i /></div><div className="art-base" /></div>
              <div className="floating-card float-two"><span className="float-icon">✓</span><span><strong>A considered next step</strong><small>Start with an enquiry</small></span></div>
            </div>
          </div>
        </section>
        <section className="trust-strip"><div className="container trust-inner"><div>⚖ <span>Professional representation, where engaged</span></div><div>✓ <span>Careful preparation and communication</span></div><div>◷ <span>Practice location to be verified</span></div></div></section>
        <section className="section services" id="services"><div className="container"><div className="section-head"><div className="eyebrow">Areas of practice</div><h2>Legal support for<br />your matter.</h2><p>Illustrative topics only. Confirm every practice area with the advocate before publishing this website.</p></div><div className="service-grid">{practices.map(item => <article className="service-card" key={item.title}><div className="service-icon">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p><a className="text-link" href="#contact" onClick={() => update('topic', item.title)}>Explore this topic ↗</a></article>)}</div></div></section>
        <section className="section about" id="about"><div className="container about-grid"><div className="about-visual"><span className="quote-mark">“</span><div><p>The law should be easier to understand, so people can ask better questions.</p><small>OUR GUIDING PRINCIPLE</small></div></div><div className="about-copy"><div className="eyebrow">About the advocate</div><h2>Personal attention.<br />Professional responsibility.</h2><p>Advocate [Full Name] is an advocate practising in [City, Maharashtra]. Add verified qualifications, Bar Council enrolment details where appropriate, genuine practice areas, languages, and professional background here. All biographical details must be approved by the advocate before publication.</p><div className="values"><div><b>✓ Clear communication</b><small>Understand the process and next steps.</small></div><div><b>✓ Careful preparation</b><small>Attention to the facts and documents provided.</small></div><div><b>✓ Confidentiality-conscious process</b><small>Use suitable channels for sensitive details.</small></div><div><b>✓ Professional integrity</b><small>Engagement only on agreed terms.</small></div></div><a className="btn btn-primary" href="#contact">Get in touch ↗</a></div></div></section>
        <section className="section insights" id="insights"><div className="container"><div className="insight-top"><div className="section-head"><div className="eyebrow">Legal updates & articles</div><h2>Legal information,<br />in plain language.</h2></div><a className="btn btn-outline" href="#contact">Ask about a matter ↗</a></div><div className="insight-grid">{articles.map((article, i) => <article className="article" key={article.tag}><div className={`article-art art-${i}`}><span>{article.tag}</span><b>{['⌂', '§', '▤'][i]}</b></div><div className="article-body"><div className="article-meta">GENERAL INFORMATION · SAMPLE ARTICLE</div><h3>{article.title}</h3><p>{article.text}</p><button className="text-link" onClick={() => setModalKey(['rental', 'notice', 'consumer'][i])}>Read the overview ↗</button></div></article>)}</div><p className="small-note">Sample general information. Have legal content reviewed for accuracy and update it when the law changes.</p></div></section>
        <section className="cta-band"><div className="container cta-inner"><div><h2>Not sure where to begin?</h2><p>Share a brief, non-sensitive summary of your question. Do not include confidential documents or sensitive case details.</p></div><div className="cta-actions"><a className="btn btn-light" href="#contact">Make an enquiry ↗</a><button className="btn btn-dark-outline" onClick={() => setModalKey('disclaimer')}>Read disclaimer</button></div></div></section>
        <section className="section contact" id="contact"><div className="container contact-grid"><div className="contact-copy"><div className="eyebrow">Contact the advocate</div><h2>Make an initial enquiry.</h2><p>Use this form to request contact about a potential legal matter. An enquiry is not an acceptance of instructions and does not create an advocate–client relationship. Confirm the response process and privacy notice before production use.</p><div className="contact-detail"><span>✉</span><div><b>Professional email</b><small>[Advocate's verified professional email]</small></div></div><div className="contact-detail"><span>⌖</span><div><b>Practice location</b><small>[Advocate's office location, Maharashtra]</small></div></div></div>
          <form className="form-card" onSubmit={submitEnquiry}><h3>Send an enquiry</h3><p>Do not submit confidential case details or documents.</p><div className="form-grid">
            <label>Your name *<input value={form.fullName} onChange={e => update('fullName', e.target.value)} autoComplete="name" maxLength={100} required /></label>
            <label>Email address *<input type="email" value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" maxLength={254} required /></label>
            <label>Phone (optional)<input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" maxLength={30} /></label>
            <label>Area of interest *<select value={form.topic} onChange={e => update('topic', e.target.value)} required><option value="">Choose a topic</option>{practices.map(p => <option key={p.title}>{p.title}</option>)}<option>Legal awareness article</option><option>Other general enquiry</option></select></label>
            <label className="full">Brief summary (optional)<textarea value={form.message} onChange={e => update('message', e.target.value)} maxLength={2000} rows={4} placeholder="Keep this general. Do not include names of other parties, case numbers, financial details, or confidential documents." /></label>
          </div><label className="consent"><input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} required /><span>I have read the privacy information and understand that submitting an enquiry does not create an advocate–client relationship.</span></label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Submit enquiry ↗'}</button>
          {status && <div className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.text}</div>}
          <p className="small-note">The form sends data to your configured API. Configure SMTP and publish a real privacy notice before public use.</p>
        </form></div></section>
      </main>
      <footer><div className="container"><div className="footer-grid"><div><a className="brand footer-brand" href="#home"><span className="brand-mark">⚖</span><span><span className="brand-name">Vocal for Legal</span><span className="brand-tag">Law · Explained · Understood</span></span></a><p className="footer-about">Legal awareness and a considered first step towards understanding your options. Built around clarity, responsibility, and respect.</p></div><div><h4>Explore</h4><a href="#services">Legal topics</a><a href="#about">About the advocate</a><a href="#insights">Legal insights</a><a href="#contact">Make an enquiry</a></div><div><h4>Information</h4><button onClick={() => setModalKey('disclaimer')}>Legal disclaimer</button><button onClick={() => setModalKey('privacy')}>Privacy overview</button><button onClick={() => setModalKey('terms')}>Terms of use</button></div><div><h4>Advocate details</h4><p>Advocate: [Full Name]<br />Office: [City, Maharashtra]<br />Details to be verified before publication.</p></div></div><div className="disclaimer"><b>Important notice.</b> This website provides general information and professional details. It is not a substitute for advice on your specific facts. An enquiry does not establish an advocate–client relationship. Website content and professional details must be reviewed for compliance with applicable Indian law and Bar Council rules before publication.</div><div className="footer-bottom"><span>© {new Date().getFullYear()} Vocal for Legal</span><span>Professional and regulatory review required before launch</span></div></div></footer>
      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModalKey(null); }} onKeyDown={e => { if (e.key === 'Escape') setModalKey(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setModalKey(null)} aria-label="Close">×</button><h2 id="modal-title">{modal.title}</h2>{modal.paragraphs.map(p => <p key={p}>{p}</p>)}<div className="modal-actions"><button className="btn btn-outline" onClick={() => setModalKey(null)}>Close</button><a className="btn btn-primary" href="#contact" onClick={() => setModalKey(null)}>Contact ↗</a></div></section></div>}
    </>
  );
}

export default App;
