import React from 'react';
import styled from 'styled-components';

export type RichSegment =
  | { type: 'text'; text: string }
  | { type: 'highlight'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'link'; text: string; href: string; external?: boolean };

interface RichTextProps {
  segments: RichSegment[];
  className?: string;
}

const HighlightSpan = styled.span`
  background: linear-gradient(135deg, #a855f7 0%, #d4a1ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
`;

const LinkSpan = styled.a`
  color: #d4a1ff;
  text-decoration: underline;
  text-decoration-color: rgba(212, 161, 255, 0.5);
  transition: all 0.3s ease;

  &:hover {
    color: #f0abfc;
    text-decoration-color: #f0abfc;
    filter: drop-shadow(0 2px 4px rgba(138, 43, 226, 0.4));
  }
`;

const ItalicSpan = styled.span`
  font-style: italic;
`;

export const RichText: React.FC<RichTextProps> = ({ segments, className }) => {
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'text':
            return <span key={index}>{segment.text}</span>;
          case 'highlight':
            return <HighlightSpan key={index}>{segment.text}</HighlightSpan>;
          case 'italic':
            return <ItalicSpan key={index}>{segment.text}</ItalicSpan>;
          case 'link': {
            const linkProps = segment.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {};
            return (
              <LinkSpan key={index} href={segment.href} {...linkProps}>
                {segment.text}
              </LinkSpan>
            );
          }
          default:
            return null;
        }
      })}
    </span>
  );
};
