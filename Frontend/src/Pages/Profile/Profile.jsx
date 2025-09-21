import React from "react";
import "./Profile.css";
import Box from "./Box";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`);
        console.log(data.data);
        setProfileUser(data.data);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            localStorage.removeItem("userInfo");
            setUser(null);
            await axios.get("/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const convertDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-");
    return formattedDate;
  };

  const connectHandler = async () => {
    console.log("Connect");
    try {
      setConnectLoading(true);
      const { data } = await axios.post(`/request/create`, {
        receiverID: profileUser._id,
      });

      console.log("Request creation response:", data);
      toast.success(data.message);
      setProfileUser((prevState) => {
        return {
          ...prevState,
          status: "Pending",
        };
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setConnectLoading(false);
    }
  };

  // Event handlers for interactive elements
  const handleButtonHover = (e) => {
    e.target.style.transform = "translate(-3px, -3px)";
    e.target.style.boxShadow = "9px 9px 0px #000";
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = "translate(0, 0)";
    e.target.style.boxShadow = "6px 6px 0px #000";
  };

  const handleButtonMouseDown = (e) => {
    e.target.style.transform = "translate(3px, 3px)";
    e.target.style.boxShadow = "3px 3px 0px #000";
  };

  const handleButtonMouseUp = (e) => {
    e.target.style.transform = "translate(-3px, -3px)";
    e.target.style.boxShadow = "9px 9px 0px #000";
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  };

  const handleCardLeave = (e) => {
    e.currentTarget.style.transform = "translate(0, 0)";
    e.currentTarget.style.boxShadow = "8px 8px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  };

  const handleCardMouseDown = (e) => {
    e.currentTarget.style.transform = "translate(4px, 4px)";
    e.currentTarget.style.boxShadow = "4px 4px 0px #000";
  };

  const handleCardMouseUp = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
  };

  const profileBoxStyle = {
    maxWidth: "1200px",
    margin: "0 auto 40px auto",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "20px",
    border: "4px solid #000",
    boxShadow: "8px 8px 0px #000",
    padding: "40px",
    transition: "all 0.2s ease",
    display: "flex",
    flexWrap: "wrap",
    gap: "40px",
    alignItems: "flex-start",
  };

  const leftDivStyle = {
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  };

  const rightDivStyle = {
    flex: "2 1 400px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const profilePhotoStyle = {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    border: "4px solid #000",
    boxShadow: "8px 8px 0px #000",
    overflow: "hidden",
    transition: "all 0.2s ease",
  };

  const profileImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const nameStyle = {
    fontSize: "2.5rem",
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: "10px",
    letterSpacing: "-1px",
    lineHeight: "1.1",
    textAlign: "center",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const ratingStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "20px",
  };

  const buttonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "3px solid #000",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "700",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "6px 6px 0px #000",
    transform: "translate(0, 0)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "5px",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center",
  };

  const connectButtonStyle = {
    ...buttonStyle,
    backgroundColor: profileUser?.status === "Connect" ? "#10b981" : "#6b7280",
    cursor: profileUser?.status === "Connect" ? "pointer" : "default",
  };

  const reportButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ef4444",
  };

  const rateButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#10b981",
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#eab308",
  };

  const portfolioLinksStyle = {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const linkStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    border: "3px solid #000",
    boxShadow: "6px 6px 0px #000",
    transition: "all 0.2s ease",
    padding: "8px",
    backgroundColor: "white",
  };

  const sectionStyle = {
    maxWidth: "1200px",
    margin: "0 auto 40px auto",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "20px",
    border: "4px solid #000",
    boxShadow: "8px 8px 0px #000",
    padding: "40px",
    transition: "all 0.2s ease",
  };

  const sectionTitleStyle = {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: "30px",
    letterSpacing: "-1px",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const bioStyle = {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "#4a4a4a",
    fontWeight: "500",
  };

  const skillBoxesStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
  };

  const skillBoxStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "3px solid #000",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "6px 6px 0px #000",
    transition: "all 0.2s ease",
  };

  const StarDecoration = ({ style }) => (
    <div
      style={{
        position: "absolute",
        fontSize: "2rem",
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        opacity: 0.8,
        animation: "sparkle 4s ease-in-out infinite",
        pointerEvents: "none",
        ...style,
      }}
    >
      ✦
    </div>
  );

  const FloatingShape = ({ style }) => (
    <div
      style={{
        position: "absolute",
        border: "3px solid rgba(139, 92, 246, 0.3)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
        pointerEvents: "none",
        ...style,
      }}
    />
  );

  return (
    <div style={containerStyle}>
      {/* Decorative Elements */}
      <StarDecoration style={{ top: "10%", left: "5%", animationDelay: "0s" }} />
      <StarDecoration style={{ top: "15%", right: "10%", animationDelay: "1.5s" }} />
      <StarDecoration style={{ bottom: "20%", left: "8%", animationDelay: "3s" }} />
      <FloatingShape style={{ top: "25%", left: "15%", width: "50px", height: "50px", animationDelay: "0s" }} />
      <FloatingShape style={{ bottom: "30%", right: "20%", width: "60px", height: "60px", animationDelay: "2s" }} />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <Spinner animation="border" style={{ color: "#8b5cf6", width: "3rem", height: "3rem" }} />
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div
            style={profileBoxStyle}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onMouseDown={handleCardMouseDown}
            onMouseUp={handleCardMouseUp}
          >
            <div style={leftDivStyle}>
              {/* Profile Photo */}
              <div style={profilePhotoStyle}>
                <img src={profileUser?.picture} alt="Profile" style={profileImageStyle} />
              </div>
              
              {/* Portfolio Links */}
              <div style={portfolioLinksStyle}>
                <a
                  href={profileUser?.githubLink ? profileUser.githubLink : "#"}
                  target={profileUser?.githubLink ? "_blank" : "_self"}
                  style={{ textDecoration: "none" }}
                >
                  <img 
                    src="/assets/images/github.png" 
                    style={linkStyle} 
                    alt="Github"
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-2px, -2px)";
                      e.target.style.boxShadow = "8px 8px 0px #000";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "6px 6px 0px #000";
                    }}
                  />
                </a>
                <a
                  href={profileUser?.linkedinLink ? profileUser.linkedinLink : "#"}
                  target={profileUser?.linkedinLink ? "_blank" : "_self"}
                  style={{ textDecoration: "none" }}
                >
                  <img 
                    src="/assets/images/linkedin.png" 
                    style={linkStyle} 
                    alt="LinkedIn"
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-2px, -2px)";
                      e.target.style.boxShadow = "8px 8px 0px #000";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "6px 6px 0px #000";
                    }}
                  />
                </a>
                <a
                  href={profileUser?.portfolioLink ? profileUser.portfolioLink : "#"}
                  target={profileUser?.portfolioLink ? "_blank" : "_self"}
                  style={{ textDecoration: "none" }}
                >
                  <img 
                    src="/assets/images/link.png" 
                    style={linkStyle} 
                    alt="Portfolio"
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-2px, -2px)";
                      e.target.style.boxShadow = "8px 8px 0px #000";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "6px 6px 0px #000";
                    }}
                  />
                </a>
              </div>
            </div>

            <div style={rightDivStyle}>
              {/* Name */}
              <h1 style={nameStyle}>{profileUser?.name}</h1>
              
              {/* Rating */}
              <div style={ratingStyle}>
                <span>
                  {profileUser?.rating
                    ? Array.from({ length: profileUser.rating }, (_, index) => <span key={index}>⭐</span>)
                    : "⭐⭐⭐⭐⭐"}
                </span>
                <span style={{ color: "#8b5cf6", fontWeight: "700" }}>
                  {profileUser?.rating ? profileUser?.rating : "5"}/5
                </span>
              </div>

              {/* Action Buttons */}
              {user?.username !== username && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    style={connectButtonStyle}
                    onClick={profileUser?.status === "Connect" ? connectHandler : undefined}
                    onMouseEnter={profileUser?.status === "Connect" ? handleButtonHover : undefined}
                    onMouseLeave={profileUser?.status === "Connect" ? handleButtonLeave : undefined}
                    onMouseDown={profileUser?.status === "Connect" ? handleButtonMouseDown : undefined}
                    onMouseUp={profileUser?.status === "Connect" ? handleButtonMouseUp : undefined}
                  >
                    {connectLoading ? (
                      <Spinner animation="border" variant="light" size="sm" style={{ marginRight: "0.5rem" }} />
                    ) : (
                      profileUser?.status
                    )}
                  </button>
                  <Link to={`/report/${profileUser.username}`} style={{ textDecoration: "none" }}>
                    <button
                      style={reportButtonStyle}
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                      onMouseDown={handleButtonMouseDown}
                      onMouseUp={handleButtonMouseUp}
                    >
                      Report
                    </button>
                  </Link>
                  <Link to={`/rating/${profileUser.username}`} style={{ textDecoration: "none" }}>
                    <button
                      style={rateButtonStyle}
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                      onMouseDown={handleButtonMouseDown}
                      onMouseUp={handleButtonMouseUp}
                    >
                      Rate
                    </button>
                  </Link>
                </div>
              )}

              {/* Edit Profile Button */}
              {user.username === username && (
                <Link to="/edit_profile" style={{ textDecoration: "none" }}>
                  <button
                    style={editButtonStyle}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                    onMouseDown={handleButtonMouseDown}
                    onMouseUp={handleButtonMouseUp}
                  >
                    Edit Profile ✎
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div
            style={sectionStyle}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onMouseDown={handleCardMouseDown}
            onMouseUp={handleCardMouseUp}
          >
            <h2 style={sectionTitleStyle}>Bio</h2>
            <p style={bioStyle}>{profileUser?.bio || "No bio available"}</p>
          </div>

          {/* Skills Section */}
          <div
            style={sectionStyle}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onMouseDown={handleCardMouseDown}
            onMouseUp={handleCardMouseUp}
          >
            <h2 style={sectionTitleStyle}>Skills Proficient At</h2>
            <div style={skillBoxesStyle}>
              {profileUser?.skillsProficientAt?.map((skill, index) => (
                <div
                  key={index}
                  style={skillBoxStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translate(-2px, -2px)";
                    e.target.style.boxShadow = "8px 8px 0px #000";
                    e.target.style.backgroundColor = "#7c3aed";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translate(0, 0)";
                    e.target.style.boxShadow = "6px 6px 0px #000";
                    e.target.style.backgroundColor = "#8b5cf6";
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div
            style={sectionStyle}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onMouseDown={handleCardMouseDown}
            onMouseUp={handleCardMouseUp}
          >
            <h2 style={sectionTitleStyle}>Education</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {profileUser?.education?.map((edu, index) => (
                <Box
                  key={index}
                  head={edu?.institution}
                  date={convertDate(edu?.startDate) + " - " + convertDate(edu?.endDate)}
                  spec={edu?.degree}
                  desc={edu?.description}
                  score={edu?.score}
                />
              ))}
            </div>
          </div>

          {/* Projects Section */}
          {profileUser?.projects && profileUser?.projects.length > 0 && (
            <div
              style={sectionStyle}
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
              onMouseDown={handleCardMouseDown}
              onMouseUp={handleCardMouseUp}
            >
              <h2 style={sectionTitleStyle}>Projects</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {profileUser?.projects?.map((project, index) => (
                  <Box
                    key={index}
                    head={project?.title}
                    date={convertDate(project?.startDate) + " - " + convertDate(project?.endDate)}
                    desc={project?.description}
                    skills={project?.techStack}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .profile-box {
            flex-direction: column !important;
            text-align: center;
          }
          
          .buttons {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;