import React from "react";
import GitHubCalendar from "react-github-calendar";
import { useContent } from "../../locales";
import "./contribution_map.scss";

const ContributionMap: React.FC = () => {
  const content = useContent();

  const labels = {
    months: content.contributionMap.months,
    weekdays: content.contributionMap.weekdays,
    totalCount: content.contributionMap.totalCount,
    legend: content.contributionMap.legend,
  };

  const theme = {
    light: ["#ffffff", "#c299ff", "#9f66ff", "#7a33cc", "#592699"],
    dark: ["#ffffff", "#c299ff", "#9f66ff", "#7a33cc", "#592699"],
  };

  const [currentYear, ...previousYears] = content.contributionMap.years;

  return (
    <div className="contribution-map-container">
      <section className="contribution-map">
        <div className="calendar-section">
          <h3 className="year-label">/{currentYear}</h3>
          <div className="calendar-wrapper">
            <GitHubCalendar
              username="tjklint"
              blockSize={18}
              fontSize={16}
              theme={theme}
              labels={labels}
              year={currentYear}
            />
          </div>
        </div>

        <div className="calendar-row">
          {previousYears.map((year) => (
            <div className="calendar-section" key={year}>
              <h3 className="year-label">/{year}</h3>
              <div className="calendar-wrapper">
                <GitHubCalendar
                  username="tjklint"
                  blockSize={11}
                  fontSize={14}
                  theme={theme}
                  labels={labels}
                  year={year}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContributionMap;
