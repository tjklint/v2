import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../../locales';
import './project_detail.scss';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const content = useContent();
  const project = content.projects.items.find((p) => p.id === id);

  return (
    <div className="project-detail">
      <Link className="project-detail__back" to="/">
        {content.projectDetail.back}
      </Link>
      {project ? (
        <>
          <h1 className="project-detail__title">{project.title}</h1>
          <p className="project-detail__label">{content.projectDetail.rawLabel}</p>
          <pre className="project-detail__raw">
            {JSON.stringify(project, null, 2)}
          </pre>
        </>
      ) : (
        <p className="project-detail__not-found">{content.projectDetail.notFound}</p>
      )}
    </div>
  );
};

export default ProjectDetail;
