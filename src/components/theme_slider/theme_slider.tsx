import React from 'react';
import { useContent } from '../../locales';
import { Theme, useTheme } from '../../contexts/theme_context';
import './theme_slider.scss';

const ThemeSlider: React.FC = () => {
  const content = useContent();
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string }[] = [
    { value: 'ex1', label: content.themeSlider.ex1 },
    { value: 'ex2', label: content.themeSlider.ex2 },
    { value: 'ex3', label: content.themeSlider.ex3 },
  ];

  return (
    <div className="theme-slider" aria-label={content.themeSlider.title}>
      <div className="theme-slider__island">
        <span className="theme-slider__title">{content.themeSlider.title}</span>
        <div className="theme-slider__track" role="group">
          {options.map((option) => (
            <button
              key={option.value}
              className={`theme-slider__option ${theme === option.value ? 'active' : ''}`}
              onClick={() => setTheme(option.value)}
              aria-pressed={theme === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSlider;
