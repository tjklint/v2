import React, { useState, useEffect } from "react";
import "./about.scss";

import { useContent } from "../../locales";
import { RichText } from "../rich_text/rich_text";

import tjklint2 from "../../assets/me/webp/tjklint2.webp";
import tjklint3 from "../../assets/me/webp/tjklint3.webp";
import tjklint4 from "../../assets/me/webp/tjklint4.webp";
import tjklint5 from "../../assets/me/webp/tjklint5.webp";
import tjklint6 from "../../assets/me/webp/tjklint6.webp";

const photos = [tjklint2, tjklint3, tjklint4, tjklint5, tjklint6];

const About: React.FC = () => {
  const content = useContent();
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    setPhoto(randomPhoto);
  }, []);

  return (
    <div className="about-container" id="about">
      <section className="about-intro">
        <div className="about-text">
          <h2 className="about-title">{content.about.title}</h2>
          {content.about.paragraphs.map((paragraph, index) => (
            <p key={index}>
              <RichText segments={paragraph} />
            </p>
          ))}
        </div>
        <div className="about-photo">
          <img src={photo} alt={content.about.photoAlt} />
        </div>
      </section>
    </div>
  );
};

export default About;
