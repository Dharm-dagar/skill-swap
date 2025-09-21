import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import "./Card.css";
import { Link } from "react-router-dom";

const ProfileCard = ({ profileImageUrl, bio, name, skills, rating, username }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    boxShadow: isHovered 
      ? "0 12px 40px rgba(139, 92, 246, 0.15)" 
      : "0 4px 20px rgba(0, 0, 0, 0.08)",
    padding: "24px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    maxWidth: "350px",
    width: "100%",
  };

  const imageStyle = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid rgba(139, 92, 246, 0.1)",
    marginBottom: "16px",
    display: "block",
    margin: "0 auto 16px auto",
  };

  const nameStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
    textAlign: "center",
    lineHeight: "1.2",
  };

  const ratingStyle = {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "12px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  };

  const bioStyle = {
    fontSize: "0.9rem",
    color: "#4b5563",
    lineHeight: "1.4",
    marginBottom: "20px",
    textAlign: "center",
    height: "42px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const buttonContainerStyle = {
    textAlign: "center",
    marginBottom: "20px",
  };

  const viewProfileButtonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
  };

  const skillsSectionStyle = {
    borderTop: "1px solid rgba(229, 231, 235, 0.3)",
    paddingTop: "16px",
  };

  const skillsHeaderStyle = {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    textAlign: "center",
  };

  const skillsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    justifyContent: "center",
  };

  const skillTagStyle = {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    color: "#6b46c1",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "500",
    border: "1px solid rgba(139, 92, 246, 0.2)",
  };

  const defaultImageStyle = {
    ...imageStyle,
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    color: "#9ca3af",
  };

  return (
    <div 
      style={cardContainerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {profileImageUrl ? (
        <img style={imageStyle} src={profileImageUrl} alt={name} />
      ) : (
        <div style={defaultImageStyle}>
          👤
        </div>
      )}
      
      <h3 style={nameStyle}>{name}</h3>
      
      <div style={ratingStyle}>
        <span>Rating:</span>
        <span style={{ color: "#f59e0b" }}>{rating}</span>
        <span style={{ color: "#f59e0b" }}>⭐</span>
      </div>
      
      <p style={bioStyle}>{bio}</p>
      
      <div style={buttonContainerStyle}>
        <Link to={`/profile/${username}`} style={{ textDecoration: "none" }}>
          <button 
            style={viewProfileButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#7c3aed";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#8b5cf6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(139, 92, 246, 0.3)";
            }}
          >
            View Profile
          </button>
        </Link>
      </div>
      
      <div style={skillsSectionStyle}>
        <h6 style={skillsHeaderStyle}>Skills</h6>
        <div style={skillsContainerStyle}>
          {skills && skills.length > 0 ? (
            skills.slice(0, 4).map((skill, index) => (
              <span key={index} style={skillTagStyle}>
                {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              No skills listed
            </span>
          )}
          {skills && skills.length > 4 && (
            <span style={{
              ...skillTagStyle,
              backgroundColor: "rgba(107, 114, 128, 0.1)",
              color: "#6b7280",
              border: "1px solid rgba(107, 114, 128, 0.2)",
            }}>
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;