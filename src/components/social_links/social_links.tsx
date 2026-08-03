import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaGlobe, FaMedium, FaDev } from 'react-icons/fa';
import { useContent } from '../../locales';
import { RichText } from '../rich_text/rich_text';
import { gradientShift } from '../../styles/animations';

const SocialContainer = styled.div`
  width: 30%;
  margin: 30px auto;
  padding: 30px;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(42, 26, 61, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.25);
  font-family: 'RobotoMono', sans-serif;
  border: 1px solid rgba(168, 85, 247, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 85%;
    padding: 24px;
  }
`;

const SocialTitle = styled.h3`
  color: #fff;
  font-size: clamp(1.3em, 2.5vw, 1.8em);
  margin-bottom: 12px;
  background: linear-gradient(135deg, #a855f7 0%, #d4a1ff 50%, #f0abfc 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: 0.05em;
  animation: ${gradientShift} 8s ease infinite;
  filter: drop-shadow(0 4px 12px rgba(138, 43, 226, 0.3));
  position: relative;
  z-index: 1;
`;

const SocialDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  font-size: clamp(0.95em, 1.5vw, 1.1em);
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  position: relative;
  z-index: 1;

  a {
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(1.8em, 3vw, 2.2em);
    transition: all 0.3s ease;

    &:hover {
      color: #d4a1ff;
      transform: translateY(-4px) scale(1.15);
      filter: drop-shadow(0 6px 16px rgba(138, 43, 226, 0.5));
    }
  }
`;

const iconMap: Record<string, React.ComponentType> = {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaMedium,
  FaDev,
};

const SocialLinks: React.FC = () => {
  const content = useContent();

  return (
    <SocialContainer>
      <SocialTitle>{content.socials.title}</SocialTitle>
      <SocialDescription>
        <RichText segments={content.socials.description} />
      </SocialDescription>
      <SocialIcons>
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
      </SocialIcons>
    </SocialContainer>
  );
};

export default SocialLinks;
