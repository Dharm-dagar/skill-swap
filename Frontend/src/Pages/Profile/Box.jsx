import React from "react";
import "./Box.css";

const Box = ({ head, date, spec, desc, skills, score }) => {
  // Event handlers for interactive effects
  const handleBoxHover = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  };

  const handleBoxLeave = (e) => {
    e.currentTarget.style.transform = "translate(0, 0)";
    e.currentTarget.style.boxShadow = "8px 8px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  };

  const handleBoxMouseDown = (e) => {
    e.currentTarget.style.transform = "translate(4px, 4px)";
    e.currentTarget.style.boxShadow = "4px 4px 0px #000";
  };

  const handleBoxMouseUp = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
  };

  // Styles
  const boxStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "4px solid #000",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "8px 8px 0px #000",
    transition: "all 0.2s ease",
    marginBottom: "20px",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: "15px",
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const detailsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  };

  const specStyle = {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#8b5cf6",
    fontStyle: "italic",
  };

  const dateStyle = {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "2px solid #000",
    boxShadow: "3px 3px 0px #000",
  };

  const descStyle = {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#4a4a4a",
    fontWeight: "500",
    marginBottom: "20px",
  };

  const skillsLabelStyle = {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#8b5cf6",
    marginBottom: "15px",
    fontStyle: "italic",
  };

  const skillBoxesStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  };

  const skillBoxStyle = {
    backgroundColor: "#10b981",
    color: "white",
    border: "2px solid #000",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    boxShadow: "4px 4px 0px #000",
    transition: "all 0.2s ease",
    cursor: "default",
  };

  const scoreStyle = {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#8b5cf6",
    fontStyle: "italic",
    backgroundColor: "#f8fafc",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "2px solid #000",
    boxShadow: "3px 3px 0px #000",
    display: "inline-block",
  };

  return (
    <div
      style={boxStyle}
      onMouseEnter={handleBoxHover}
      onMouseLeave={handleBoxLeave}
      onMouseDown={handleBoxMouseDown}
      onMouseUp={handleBoxMouseUp}
    >
      {/* Decorative corner accent */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          width: "30px",
          height: "30px",
          background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
          borderRadius: "50%",
          border: "2px solid #000",
          boxShadow: "3px 3px 0px #000",
          opacity: 0.8,
        }}
      />

      <h5 style={headingStyle}>{head}</h5>
      
      <div style={detailsStyle}>
        <span style={specStyle}>{spec}</span>
        <span style={dateStyle}>{date}</span>
      </div>

      <p style={descStyle}>{desc}</p>

      {skills && (
        <>
          <p style={skillsLabelStyle}>Skills Used:</p>
          <div style={skillBoxesStyle}>
            {skills?.map((skill, index) => (
              <div
                key={index}
                style={skillBoxStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translate(-2px, -2px)";
                  e.target.style.boxShadow = "6px 6px 0px #000";
                  e.target.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translate(0, 0)";
                  e.target.style.boxShadow = "4px 4px 0px #000";
                  e.target.style.backgroundColor = "#10b981";
                }}
              >
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {score && (
        <div style={{ marginTop: "20px" }}>
          <span style={scoreStyle}>Grade / Percentage: {score}</span>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .details {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .skill-boxes {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Box;