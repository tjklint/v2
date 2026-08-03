import React, { useMemo } from 'react';
import {
  FaExternalLinkAlt,
  FaFilePdf,
  FaGithub,
  FaMicrophone,
  FaYoutube,
} from 'react-icons/fa';
import { useContent } from '../../locales';
import { RichText } from '../rich_text/rich_text';
import './speaking.scss';

import { TalkContent } from '../../locales/types';

const parseDate = (iso: string) => {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const Speaking: React.FC = () => {
  const content = useContent();

  const { upcoming, past } = useMemo(() => {
    const talks = content.speaking.talks;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const future: TalkContent[] = [];
    const history: TalkContent[] = [];
    talks.forEach((t) => {
      if (parseDate(t.date) >= today) future.push(t);
      else history.push(t);
    });
    future.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    history.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    return { upcoming: future, past: history };
  }, [content.speaking.talks]);

  const renderCard = (talk: TalkContent, kind: 'upcoming' | 'past') => (
    <article className={`speaking-card speaking-card--${kind}`} key={`${talk.event}-${talk.date}`}>
      <div className="speaking-card__head">
        <FaMicrophone className="speaking-card__icon" aria-hidden="true" />
        <span className="speaking-card__date">{formatDate(talk.date)}</span>
        {talk.kind && <span className="speaking-card__kind">{talk.kind}</span>}
      </div>
      <h3 className="speaking-card__title">{talk.title ?? talk.event}</h3>
      {talk.title && <p className="speaking-card__event-line">{talk.event}</p>}
      {talk.location && <p className="speaking-card__location">{talk.location}</p>}
      <div className="speaking-card__links">
        <a
          href={talk.website}
          target="_blank"
          rel="noopener noreferrer"
          className="speaking-card__link"
        >
          <FaExternalLinkAlt /> {content.speaking.linkLabels.event}
        </a>
        {talk.slides && (
          <a
            href={talk.slides}
            target="_blank"
            rel="noopener noreferrer"
            className="speaking-card__link"
          >
            <FaFilePdf /> {content.speaking.linkLabels.slides}
          </a>
        )}
        {talk.repo && (
          <a
            href={talk.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="speaking-card__link"
          >
            <FaGithub /> {content.speaking.linkLabels.repo}
          </a>
        )}
        {talk.video && (
          <a
            href={talk.video}
            target="_blank"
            rel="noopener noreferrer"
            className="speaking-card__link speaking-card__link--video"
          >
            <FaYoutube /> {content.speaking.linkLabels.watch}
          </a>
        )}
      </div>
    </article>
  );

  return (
    <section className="speaking-container" id="speaking">
      <div className="speaking-content-left">
        <div className="speaking-intro__text">
          <h2 className="speaking-title">{content.speaking.title}</h2>
          {content.speaking.intro.map((paragraph, index) => (
            <p key={index}>
              <RichText segments={paragraph} />
            </p>
          ))}
          <p className="speaking-intro__cta">
            <RichText segments={content.speaking.cta} />
          </p>
        </div>

        {upcoming.length > 0 && (
          <div className="speaking-group">
            <h3 className="speaking-group__label">{content.speaking.groupLabels.upcoming}</h3>
            <div className="speaking-grid">
              {upcoming.map((t) => renderCard(t, 'upcoming'))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="speaking-group">
            <h3 className="speaking-group__label">{content.speaking.groupLabels.past}</h3>
            <div className="speaking-grid">
              {past.map((t) => renderCard(t, 'past'))}
            </div>
          </div>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <p className="speaking-empty">
            <RichText segments={content.speaking.empty} />
          </p>
        )}
      </div>
      <div className="speaking-content-right">
        <div className="speaking-video-container">
          <iframe
            src={content.speaking.videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Speaking;
