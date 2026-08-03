import React, { useState } from 'react';
import { FaHome, FaUser, FaCode, FaFileAlt, FaBars, FaTimes, FaStar, FaCodeBranch, FaMicrophone } from 'react-icons/fa';
import { useContent } from '../../locales';
import './header.scss';

const Header: React.FC = () => {
  const content = useContent();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header className="header-container">
      <a href="#home" className="logo" onClick={(e) => handleClick(e, 'home')}>
        {content.meta.logo}
      </a>
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={30} className="close-icon" /> : <FaBars size={30} />}
      </div>
      <nav className={`nav ${isOpen ? 'open' : ''}`}>
        <a href="#home" className="nav-link" onClick={(e) => handleClick(e, 'home')}>
          <FaHome />
          {content.nav.home}
        </a>
        <a href="#about" className="nav-link" onClick={(e) => handleClick(e, 'about')}>
          <FaUser />
          {content.nav.about}
        </a>
        <a href="#speaking" className="nav-link" onClick={(e) => handleClick(e, 'speaking')}>
          <FaMicrophone />
          {content.nav.speaking}
        </a>
        <a href="#resume" className="nav-link" onClick={(e) => handleClick(e, 'resume')}>
          <FaFileAlt />
          {content.nav.resume}
        </a>
        <a href="#projects" className="nav-link" onClick={(e) => handleClick(e, 'projects')}>
          <FaCode />
          {content.nav.projects}
        </a>
        <a
          className="button"
          href="https://github.com/tjklint/tjklint.github.io"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          aria-label={content.nav.repoAria}
        >
          <FaStar />
          {`or\u00A0`}
          <FaCodeBranch />
        </a>
      </nav>
    </header>
  );
};

export default Header;
