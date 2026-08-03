import { useContent } from '../../locales';
import './resume.scss';
import VisualAid from './visualaid';

const Resume: React.FC = () => {
  const content = useContent();

  return (
    <div className="resume-container" id="resume">
      <div className="content-wrapper">
        <div className="left-column">
          {content.resume.sections
            .filter((section) => section.key !== 'education')
            .map((section) => (
              <VisualAid key={section.title} section={section} />
            ))}
        </div>
        <div className="right-column">
          <iframe
            title={content.resume.iframeTitle}
            src={content.resume.iframeUrl}
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Resume;
