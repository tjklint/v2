import React from 'react';
import styled from 'styled-components';
import { HashRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './locales';
import { ThemeProvider, useTheme } from './contexts/theme_context';

// @ts-ignore
import Header from './components/header/header.tsx';
// @ts-ignore
import Hero from './components/hero/hero.tsx';
// @ts-ignore
import About from './components/about/about.tsx';
// @ts-ignore
import Speaking from './components/speaking/speaking.tsx';
// @ts-ignore
import Resume from './components/resume/resume.tsx';
// @ts-ignore
import Projects from './components/projects/projects.tsx';
// @ts-ignore
import ContributionMap from './components/contribution_map/contribution_map.tsx';
// @ts-ignore
import SocialLinks from './components/social_links/social_links.tsx';
// @ts-ignore
import Footer from './components/footer/footer.tsx';
// @ts-ignore
import ChatBubble from './components/chat_bubble/chat_bubble.tsx';
// @ts-ignore
import ThemeSlider from './components/theme_slider/theme_slider.tsx';
// @ts-ignore
import Web1Theme from './components/web1_theme/web1_theme.tsx';
// @ts-ignore
import RawHelloWorld from './components/raw_hello_world/raw_hello_world.tsx';

const AppContainer = styled.div`
  background: linear-gradient(135deg, #1e1e1e 0%, #2a1a3d 50%, #1e1e1e 100%);
  background-size: 200% 200%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
`;

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      {theme === 'ex2' ? (
        <AppContainer>
          <Header />
          <Hero />
          <About />
          <Speaking />
          <Resume />
          <Projects />
          <ContributionMap />
          <SocialLinks />
          <Footer />
          <ChatBubble />
        </AppContainer>
      ) : theme === 'ex1' ? (
        <Web1Theme />
      ) : (
        <RawHelloWorld />
      )}
      <ThemeSlider />
    </>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
