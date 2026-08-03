import React from 'react';
import './footer.scss';
import { FaGithub, FaLinkedin, FaGlobe, FaMedium, FaDev } from 'react-icons/fa';
import { useContent } from '../../locales';
import { RichText } from '../rich_text/rich_text';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaMedium,
  FaDev,
};

const Footer: React.FC = () => {
  const content = useContent();

  return (
    <footer className="footer-container">
      <div className="left-align">
        <p>
          <RichText segments={content.footer.credit} />
        </p>
      </div>
      <div className="center-align">
        <p>{content.footer.copyright}</p>
      </div>
      <div className="right-align social-icons">
        {content.socials.links.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
            >
              {Icon ? <Icon /> : null}
            </a>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
