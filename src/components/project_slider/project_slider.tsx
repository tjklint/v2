import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../locales';
import { ProjectContent } from '../../locales/types';
import { projectAssetMap, defaultProjectImage } from '../../utils/project_assets';
import './project_slider.scss';

const ProjectSlider: React.FC = () => {
  const content = useContent();
  const navigate = useNavigate();

  const [left, center, right] = useMemo(() => {
    const shuffled = [...content.projects.items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [content.projects.items]);

  const renderCard = (project: ProjectContent, isCenter: boolean) => {
    const imageSrc = projectAssetMap[project.image] || defaultProjectImage;
    const altText = content.projects.altTemplate.replace('{title}', project.title);

    const handleActivate = () => {
      navigate(`/project/${project.id}`);
    };

    return (
      <div
        key={project.id}
        className={`slider-card ${isCenter ? 'slider-card--center' : ''}`}
        onClick={handleActivate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActivate();
          }
        }}
      >
        <img src={imageSrc} alt={altText} />
        <div className="slider-card__content">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <span className="slider-card__cta">{content.projectSlider.viewProject}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="project-slider" id="project-slider">
      <h2 className="project-slider__title">{content.projectSlider.title}</h2>
      <div className="project-slider__track">
        {renderCard(left, false)}
        {renderCard(center, true)}
        {renderCard(right, false)}
      </div>
    </section>
  );
};

export default ProjectSlider;
