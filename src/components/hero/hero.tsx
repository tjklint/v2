import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import spaceship from '../../assets/spaceship/webp/spaceship.webp';
import { useContent } from '../../locales';
import { TalkContent } from '../../locales/types';
import { gradientShift } from '../../styles/animations';

const HeroContainer = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 100px;
  background: linear-gradient(135deg, #1e1e1e 0%, #2a1a3d 50%, #1e1e1e 100%);
  background-size: 200% 200%;
  animation: ${gradientShift} 15s ease infinite;
  color: #fff;
  overflow: hidden;
  font-family: 'RobotoMono', sans-serif;
  position: relative;

  @media (max-width: 768px) {
    padding-top: 90px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(212, 161, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  text-align: left;
  margin-top: -10%;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 24px;
    margin-top: 0;
  }

  @media (min-width: 768px) {
    flex: 0 0 35%;
    padding: 60px 40px;
  }
`;

const Headline = styled.h1`
  font-size: 1.25em;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5em;
  letter-spacing: 0.05em;
  line-height: 1.6;
  transition: color 0.3s ease;

  @media (min-width: 768px) {
    font-size: 1.5em;
  }
`;

const RightContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 50vh;

  @media (min-width: 768px) {
    flex: 0 0 65%;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-15px) rotate(1deg);
  }
  66% {
    transform: translateY(-5px) rotate(-1deg);
  }
`;

const Spaceship = styled.img`
  width: 80%;
  z-index: 1;
  animation: ${floatAnimation} 4s ease-in-out infinite;
  filter: drop-shadow(0 20px 40px rgba(138, 43, 226, 0.3));
  transition: transform 0.3s ease;

  @media (min-width: 768px) {
    width: 50%;
  }
`;

const shrinkAndMove = (left: number, top: number, containerWidth: number, containerHeight: number) => keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(${containerWidth / 2 - left}px, ${containerHeight / 2 - top}px) scale(0);
    opacity: 0;
  }
`;

const Circle = styled.div<{ left: number; top: number; size: number; containerWidth: number; containerHeight: number }>`
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(212, 161, 255, 0.6) 100%);
  border-radius: 50%;
  backdrop-filter: blur(2px);

  ${({ left, top, size, containerWidth, containerHeight }) => css`
    width: ${size}px;
    height: ${size}px;
    left: ${left}px;
    top: ${top}px;
    animation: ${shrinkAndMove(left, top, containerWidth, containerHeight)} 2s ease-out forwards;
    box-shadow: 0 0 ${size / 2}px rgba(212, 161, 255, 0.5);
  `}
`;

const GradientText = styled.h2`
  background: linear-gradient(135deg, #a855f7 0%, #d4a1ff 50%, #f0abfc 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(2.5em, 8vw, 5em);
  font-weight: 700;
  margin: 0.3em 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
  animation: ${gradientShift} 8s ease infinite;
  filter: drop-shadow(0 4px 12px rgba(138, 43, 226, 0.3));

  @media (min-width: 768px) {
    font-size: clamp(3.5em, 6vw, 5.5em);
  }
`;

const blink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

const TypewriterText = styled.div`
  color: #d4a1ff;
  font-size: clamp(1.1em, 3vw, 1.75em);
  margin-top: 1em;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 500;
  letter-spacing: 0.02em;

  &::after {
    content: '_';
    animation: ${blink} 1s infinite;
    color: #a855f7;
    font-weight: 300;
  }
`;

const TalkLink = styled.a`
  display: inline-block;
  margin-top: 1.5em;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(42, 26, 61, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(0.9em, 1.8vw, 1.1em);
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.2);
  align-self: flex-start;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(138, 43, 226, 0.4);
    border-color: rgba(212, 161, 255, 0.5);
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(212, 161, 255, 0.1) 100%);
  }

  .event-name {
    background: linear-gradient(135deg, #a855f7 0%, #d4a1ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  &:hover .event-name {
    background: linear-gradient(135deg, #d4a1ff 0%, #f0abfc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const TalkDescription = styled.a`
  display: block;
  margin-top: 0.75em;
  color: rgba(255, 255, 255, 0.7);
  font-size: clamp(0.85em, 1.5vw, 1em);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.5;
  align-self: flex-start;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

interface CircleProps {
  id: number;
  left: number;
  top: number;
  size: number;
  containerWidth: number;
  containerHeight: number;
}

const Hero: React.FC = () => {
  const content = useContent();
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const [topLine, setTopLine] = useState('');
  const [currentText, setCurrentText] = useState('');
  const rightContainerRef = useRef<HTMLDivElement>(null);

  const topLines = content.hero.topLines;
  const typewriterTexts = content.hero.typewriter;

  const getTalkInfo = (): { isFuture: boolean; talk: TalkContent | null } => {
    const talks = content.speaking.talks;
    if (talks.length === 0) return { isFuture: false, talk: null };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const futureTalks = talks.filter(talk => {
      const talkDate = new Date(talk.date);
      talkDate.setHours(0, 0, 0, 0);
      return talkDate >= now;
    });

    if (futureTalks.length > 0) {
      futureTalks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { isFuture: true, talk: futureTalks[0] };
    }

    return { isFuture: false, talk: null };
  };

  const { isFuture, talk } = getTalkInfo();

  useEffect(() => {
    setTopLine(topLines[Math.floor(Math.random() * topLines.length)]);
  }, [topLines]);

  useEffect(() => {
    const typeWriter = () => {
      let i = 0;
      let textPos = 0;
      let currentString = typewriterTexts[i];
      const speed = 100;
      const deleteSpeed = 50;
      const waitTime = 2000;

      function type() {
        setCurrentText(currentString.substring(0, textPos));

        if (textPos++ === currentString.length) {
          setTimeout(() => deleteText(), waitTime);
        } else {
          setTimeout(type, speed);
        }
      }

      function deleteText() {
        setCurrentText(currentString.substring(0, textPos));

        if (textPos-- === 0) {
          i = (i + 1) % typewriterTexts.length;
          currentString = typewriterTexts[i];
          setTimeout(type, speed);
        } else {
          setTimeout(deleteText, deleteSpeed);
        }
      }

      type();
    };

    typeWriter();
  }, [typewriterTexts]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (rightContainerRef.current) {
        const containerWidth = rightContainerRef.current.clientWidth;
        const containerHeight = rightContainerRef.current.clientHeight;

        const newCircles: CircleProps[] = Array.from({ length: 7 }).map(() => {
          const isVerticalEdge = Math.random() > 0.5;
          const left = isVerticalEdge
            ? (Math.random() > 0.5 ? 0 : containerWidth - 10)
            : Math.random() * containerWidth;

          const top = !isVerticalEdge
            ? (Math.random() > 0.5 ? 0 : containerHeight - 10)
            : Math.random() * containerHeight;

          return {
            id: Date.now() + Math.random(),
            left,
            top,
            size: Math.random() * 20 + 10,
            containerWidth,
            containerHeight,
          };
        });

        setCircles(prevCircles => [...prevCircles, ...newCircles]);

        setTimeout(() => {
          setCircles(prevCircles =>
            prevCircles.filter(circle => !newCircles.some(newCircle => newCircle.id === circle.id))
          );
        }, 2000);
      }
    }, 333);

    return () => clearInterval(interval);
  }, []);

  return (
    <HeroContainer>
      <LeftContainer>
        <Headline>{topLine}</Headline>
        <GradientText>{content.meta.headline}</GradientText>
        <TypewriterText>{currentText}</TypewriterText>
        {isFuture && talk ? (
          <TalkLink
            href={talk.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.hero.nextTalkLabel} <span className="event-name">{talk.event}</span>
          </TalkLink>
        ) : (
          <TalkLink
            href={`mailto:${content.meta.email}?subject=${encodeURIComponent(content.hero.talkSubject)}`}
          >
            {content.hero.nextTalkLabel} <span className="event-name">{content.hero.yourEvent}</span>
          </TalkLink>
        )}
        <TalkDescription
          href={content.hero.slidesPath}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.hero.checkOut}
        </TalkDescription>
      </LeftContainer>
      <RightContainer ref={rightContainerRef}>
        <Spaceship src={spaceship} alt={content.hero.spaceshipAlt} />
        {circles.map(circle => (
          <Circle
            key={circle.id}
            left={circle.left}
            top={circle.top}
            size={circle.size}
            containerWidth={circle.containerWidth}
            containerHeight={circle.containerHeight}
          />
        ))}
      </RightContainer>
    </HeroContainer>
  );
};

export default Hero;
