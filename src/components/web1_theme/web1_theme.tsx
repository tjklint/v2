import React, { useEffect, useMemo, useState } from 'react';
import { useContent } from '../../locales';
import { RichText } from '../rich_text/rich_text';
import './web1_theme.scss';

const Web1Theme: React.FC = () => {
  const content = useContent();
  const [visitorCount, setVisitorCount] = useState(42069);

  useEffect(() => {
    const saved = localStorage.getItem('web1-visitor-count');
    const count = saved ? parseInt(saved, 10) : 42069;
    const next = count + 1;
    setVisitorCount(next);
    localStorage.setItem('web1-visitor-count', String(next));
  }, []);

  const today = useMemo(() => new Date().toLocaleDateString(), []);
  const topLine = useMemo(
    () => content.hero.topLines[Math.floor(Math.random() * content.hero.topLines.length)],
    [content.hero.topLines]
  );

  return (
    <div className="web1-theme">
      <div className="web1-stars" aria-hidden="true" />

      <div className="web1-outer">
        <div className="web1-construction-banner">
          <span className="web1-construction-emoji">🚧</span>
          <span className="web1-blink">UNDER CONSTRUCTION</span>
          <span className="web1-construction-emoji">🚧</span>
        </div>

        <div className="web1-marquee">
          <div className="web1-marquee-content">
            ★ Welcome to {content.meta.name}'s Web 1.0 Homestead ★ Best viewed in Netscape Navigator 3.0
            at 800x600 ★ MIDI music coming soon ★ Sign my guestbook ★
          </div>
        </div>

        <header className="web1-header">
          <h1 className="web1-title">{content.meta.name}</h1>
          <p className="web1-tagline">{topLine}</p>
          <p className="web1-headline">{content.meta.headline}</p>

          <div className="web1-badges">
            <span className="web1-badge">Netscape Now!</span>
            <span className="web1-badge">Internet Explorer 4.0</span>
            <span className="web1-badge">800x600</span>
            <span className="web1-badge">No Frames</span>
          </div>

          <div className="web1-counter-box">
            <div className="web1-counter-label">YOU ARE VISITOR #</div>
            <div className="web1-counter">{String(visitorCount).padStart(8, '0')}</div>
          </div>
        </header>

        <nav className="web1-nav">
          <a href="#about">About</a>
          <span className="web1-nav-sep">|</span>
          <a href="#speaking">Speaking</a>
          <span className="web1-nav-sep">|</span>
          <a href="#projects">Projects</a>
          <span className="web1-nav-sep">|</span>
          <a href="#resume">Resume</a>
          <span className="web1-nav-sep">|</span>
          <a href="#connect">Connect</a>
          <span className="web1-nav-sep">|</span>
          <a href="#guestbook">Guestbook</a>
        </nav>

        <section className="web1-section" id="about">
          <h2 className="web1-section-title">
            <span className="web1-blink">NEW!</span> About Me
          </h2>
          {content.about.paragraphs.map((paragraph, index) => (
            <p key={index} className="web1-paragraph">
              <RichText segments={paragraph} className="web1-rich-text" />
            </p>
          ))}
          <div className="web1-awards">
            <span className="web1-award">🏆 Cool Site of the Nanosecond</span>
            <span className="web1-award">🌐 Featured on GeoCities</span>
            <span className="web1-award">💾 100% Frames Free</span>
          </div>
        </section>

        <section className="web1-section" id="speaking">
          <h2 className="web1-section-title">Speaking</h2>
          <p className="web1-paragraph">
            <RichText segments={content.speaking.intro[0]} className="web1-rich-text" />
          </p>
          <p className="web1-paragraph">
            <RichText segments={content.speaking.intro[1]} className="web1-rich-text" />
          </p>
          <p className="web1-paragraph">
            <RichText segments={content.speaking.cta} className="web1-rich-text" />
          </p>

          <h3 className="web1-subtitle">Upcoming & Past Talks</h3>
          <table className="web1-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Event</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {content.speaking.talks.map((talk) => (
                <tr key={talk.id}>
                  <td>{talk.date}</td>
                  <td>{talk.title ?? '-'}</td>
                  <td>{talk.event}</td>
                  <td>
                    <a href={talk.website} target="_blank" rel="noopener noreferrer">
                      {content.speaking.linkLabels.event}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="web1-section" id="projects">
          <h2 className="web1-section-title">Projects</h2>
          <p className="web1-paragraph">A collection of things I have built, shipped, and sometimes broken on purpose.</p>
          <table className="web1-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Tags</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {content.projects.items.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>{project.tags.join(', ')}</td>
                  <td>
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                      {content.projects.seeOnGithub}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="web1-section" id="resume">
          <h2 className="web1-section-title">Experience & Education</h2>
          {content.resume.sections.map((section) => (
            <div key={section.key} className="web1-resume-section">
              <h3 className="web1-subtitle">{section.title}</h3>
              <ul className="web1-list">
                {section.entries.map((entry) => (
                  <li key={`${entry.title}-${entry.dates}`} className="web1-resume-entry">
                    <strong>{entry.title}</strong>
                    {' '}
                    <span className="web1-company">{entry.company}</span>
                    <br />
                    <span className="web1-dates">{entry.dates}</span>
                    {entry.bulletPoints && entry.bulletPoints.length > 0 && (
                      <ul className="web1-sublist">
                        {entry.bulletPoints.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="web1-section" id="connect">
          <h2 className="web1-section-title">Connect With Me</h2>
          <p className="web1-paragraph">
            <RichText segments={content.socials.description} className="web1-rich-text" />
          </p>
          <ul className="web1-list web1-connect-list">
            {content.socials.links.map((link) => (
              <li key={link.name}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${content.meta.email}`}>Email Me</a>
            </li>
          </ul>
        </section>

        <section className="web1-section" id="guestbook">
          <h2 className="web1-section-title">Sign My Guestbook</h2>
          <div className="web1-guestbook">
            <div className="web1-guestbook-entry">
              <span className="web1-guestbook-name">Webmaster</span>
              <span className="web1-guestbook-date">{today}</span>
              <p>"This site rules!!! Come back soon!!!"</p>
            </div>
            <div className="web1-guestbook-entry">
              <span className="web1-guestbook-name">A Friend</span>
              <span className="web1-guestbook-date">{today}</span>
              <p>"Nice MIDI. Where is the dancing baby?"</p>
            </div>
            <div className="web1-guestbook-entry">
              <span className="web1-guestbook-name">Claude</span>
              <span className="web1-guestbook-date">{today}</span>
              <p>"Just a helpful assistant passing through."</p>
            </div>
          </div>
        </section>

        <footer className="web1-footer">
          <div className="web1-webring">
            <a href="#">&lt; Previous Cool Site</a>
            <span> | AI Homestead Webring | </span>
            <a href="#">Next Cool Site &gt;</a>
          </div>

          <p className="web1-copyright">
            {content.footer.copyright}
          </p>
          <p className="web1-last-updated">Last updated: {today}</p>
          <p className="web1-disclaimer">
            Best viewed in Netscape Navigator 3.0 at 800x600 with the sound ON.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Web1Theme;
