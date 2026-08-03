import React, { useState, useMemo } from 'react';
import { FaGithub, FaGlobe, FaSearch } from 'react-icons/fa';
import { useContent } from '../../locales';
import { ProjectContent } from '../../locales/types';
import './projects.scss';

import investSmartGif from '../../assets/projects/InvestSmart.gif';
import pokePCGif from '../../assets/projects/PokePC.gif';
import privacyXPressoGif from '../../assets/projects/PrivacyXPresso.gif';
import portfolioGif from '../../assets/projects/Portfolio.gif';
import digitalAdrenalineGif from '../../assets/projects/DigitalAdrenaline.gif';
import ecovestGif from '../../assets/projects/Ecovest.gif';
import habitGif from '../../assets/projects/habit.gif';
import mySecretaryGif from '../../assets/projects/MySecretary.gif';
import pathfinderGif from '../../assets/projects/Pathfinder.gif';

const assetMap: { [key: string]: string } = {
  'InvestSmart.gif': investSmartGif,
  'PokePC.gif': pokePCGif,
  'PrivacyXPresso.gif': privacyXPressoGif,
  'Portfolio.gif': portfolioGif,
  'DigitalAdrenaline.gif': digitalAdrenalineGif,
  'Ecovest.gif': ecovestGif,
  'habit.gif': habitGif,
  'MySecretary.gif': mySecretaryGif,
  'Pathfinder.gif': pathfinderGif,
};

const handleComingSoonClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>, alertText: string) => {
  event.preventDefault();
  alert(alertText);
};

const Projects: React.FC = () => {
  const content = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    content.projects.items.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [content.projects.items]);

  const filteredProjects = useMemo(() => {
    const allProjects = content.projects.items;

    let filtered = allProjects.filter(project => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.languages.some(lang => lang.toLowerCase().includes(query)) ||
        project.technologies.frameworks.some(fw => fw.toLowerCase().includes(query)) ||
        project.technologies.libraries.some(lib => lib.toLowerCase().includes(query)) ||
        project.tags.some(tag => tag.toLowerCase().includes(query));

      const matchesTag = !selectedTag || project.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });

    if (!showAll && !searchTerm && !selectedTag) {
      filtered = filtered.filter(p => p.featured);
    }

    filtered = filtered.sort((a, b) => {
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });

    return filtered;
  }, [searchTerm, selectedTag, showAll, content.projects.items]);

  const bigProjects = filteredProjects.filter(project => project.category === 'big');
  const smallProjects = filteredProjects.filter(project => project.category === 'small');

  const renderTechnologies = (technologies: ProjectContent['technologies']) => {
    const allTech = [
      ...technologies.languages,
      ...technologies.frameworks,
      ...technologies.libraries
    ];

    return (
      <div className="project-technologies">
        <span className="tech-uses">{content.projects.usesLabel}</span>
        <div className="tech-items">
          {allTech.map((tech, index) => (
            <span key={index} className="tech-item">{tech}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderProject = (project: ProjectContent, isSmall: boolean = false) => {
    const imageSrc = assetMap[project.image] || portfolioGif;
    const containerClass = isSmall ? 'small-project' : 'project-container';
    const altText = content.projects.altTemplate.replace('{title}', project.title);

    return (
      <div key={project.id} className={containerClass}>
        <img src={imageSrc} alt={altText} />
        <div className="project-content">
          <div className="project-header">
            <h3>{project.title}</h3>
            <div className="project-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <p className="project-description">{project.description}</p>
          {renderTechnologies(project.technologies)}
          <div className="project-links">
            <a href={project.links.github} target="_blank" rel="noopener noreferrer">
              <FaGithub /> {content.projects.seeOnGithub}
            </a>
            {project.links.demo ? (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <FaGlobe /> {content.projects.tryItOut}
              </a>
            ) : (
              <button onClick={(e) => handleComingSoonClick(e, content.projects.comingSoonAlert)} style={{
                background: 'none',
                border: 'none',
                color: '#9b59b6',
                fontSize: '1.2em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                fontFamily: 'inherit'
              }}>
                <FaGlobe /> {content.projects.tryItOut}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="projects-container" id="projects">
      <h2 className="section-title">{content.projects.title}</h2>

      <div className="projects-controls">
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={content.projects.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`show-all-button ${showAll ? 'active' : ''}`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? content.projects.showFeaturedLabel : content.projects.showAllLabel}
          </button>
        </div>

        <div className="filter-tags">
          <button
            className={`tag-filter ${!selectedTag ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            {content.projects.allTags}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="projects-display">
        {filteredProjects.length === 0 ? (
          <div className="no-results">
            {content.projects.noResults}
          </div>
        ) : (
          <>
            {bigProjects.length > 0 && (
              <div className="big-projects-container">
                {bigProjects.map(project => renderProject(project, false))}
              </div>
            )}

            {smallProjects.length > 0 && (
              <div className="small-projects-container">
                {smallProjects.map(project => renderProject(project, true))}

                {!searchTerm && !selectedTag && (smallProjects.length < 4 || showAll) && (
                  <div className="coming-soon-project">
                    <div className="project-content">
                      <h3>{content.projects.comingSoon.title}</h3>
                      <p>{content.projects.comingSoon.description}</p>
                      <div className="project-links">
                        <a href={content.projects.comingSoon.github} target="_blank" rel="noopener noreferrer">
                          <FaGithub /> {content.projects.seeOnGithub}
                        </a>
                        <a href={content.projects.comingSoon.website} target="_blank" rel="noopener noreferrer">
                          <FaGlobe /> {content.projects.visitWebsite}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
