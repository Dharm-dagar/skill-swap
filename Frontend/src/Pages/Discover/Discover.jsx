import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ProfileCard from "./ProfileCard";
import "./Discover.css";
import Search from "./Search";
import Spinner from "react-bootstrap/Spinner";

const Discover = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [webDevUsers, setWebDevUsers] = useState([]);
  const [mlUsers, setMlUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("for-you");

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/registered/getDetails`);
        console.log(data.data);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };
    const getDiscoverUsers = async () => {
      try {
        const { data } = await axios.get("/user/discover");
        console.log(data);
        setDiscoverUsers(data.data.forYou);
        setWebDevUsers(data.data.webDev);
        setMlUsers(data.data.ml);
        setOtherUsers(data.data.others);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    getUser();
    getDiscoverUsers();
  }, []);

  // Enhanced interactive handlers
  const handleNavHover = (e) => {
    if (!e.target.style.backgroundColor.includes("139, 92, 246")) {
      e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
      e.target.style.color = "#8b5cf6";
    }
  };

  const handleNavLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = "transparent";
      e.target.style.color = "#4b5563";
    }
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced styles
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  };

  const mainContainerStyle = {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    gap: "30px",
    minHeight: "100vh",
  };

  const sidebarStyle = {
    position: "fixed",
    left: "20px",
    top: "20px",
    width: "280px",
    height: "calc(100vh - 40px)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    boxShadow: "0 4px 20px rgba(139, 92, 246, 0.1)",
    padding: "24px 20px",
    zIndex: 100,
    overflowY: "auto",
  };

  const contentAreaStyle = {
    marginLeft: "320px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "12px",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    padding: "10px",
    minHeight: "calc(100vh - 40px)",
    width: "100%"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "50px",
  };

  const mainTitleStyle = {
    fontSize: "4rem",
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: "20px",
    letterSpacing: "-2px",
    lineHeight: "1.1",
    textShadow: "3px 3px 0px rgba(139, 92, 246, 0.1)",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const sectionTitleStyle = {
    fontSize: "2.5rem",
    fontWeight: "800",
    marginBottom: "30px",
    marginTop: "50px",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-1px",
  };

  const navItemStyle = (isActive) => ({
    display: "block",
    padding: "14px 18px",
    margin: "6px 0",
    backgroundColor: isActive ? "#8b5cf6" : "transparent",
    color: isActive ? "white" : "#4b5563",
    textDecoration: "none",
    borderRadius: "8px",
    border: isActive ? "none" : "1px solid rgba(229, 231, 235, 0.3)",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    boxShadow: isActive ? "0 2px 8px rgba(139, 92, 246, 0.3)" : "none",
  });

  const profileCardsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  };

  const noUsersMessageStyle = {
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "500",
    color: "#6b7280",
    padding: "40px 20px",
    backgroundColor: "rgba(249, 250, 251, 0.6)",
    borderRadius: "12px",
    border: "1px solid rgba(229, 231, 235, 0.3)",
  };

  const loadingContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    flexDirection: "column",
    gap: "20px",
  };

  const StarDecoration = ({ style }) => (
    <div
      style={{
        position: "absolute",
        fontSize: "2rem",
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        opacity: 0.6,
        animation: "sparkle 4s ease-in-out infinite",
        pointerEvents: "none",
        zIndex: 1,
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
        zIndex: 1,
        ...style,
      }}
    />
  );

  const navItems = [
    { id: "for-you", label: "🎯 For You", emoji: "🎯" },
    { id: "popular", label: "🔥 Popular", emoji: "🔥" },
    { id: "web-development", label: "💻 Web Dev", emoji: "💻" },
    { id: "machine-learning", label: "🤖 ML/AI", emoji: "🤖" },
    { id: "others", label: "🌟 Others", emoji: "🌟" },
  ];

  return (
    <div style={containerStyle}>
      {/* Decorative Elements */}
      <StarDecoration style={{ top: "10%", left: "5%", animationDelay: "0s" }} />
      <StarDecoration style={{ top: "15%", right: "10%", animationDelay: "1.5s" }} />
      <StarDecoration style={{ bottom: "20%", left: "8%", animationDelay: "3s" }} />
      <StarDecoration style={{ top: "60%", right: "15%", animationDelay: "2.5s" }} />
      <FloatingShape style={{ top: "25%", left: "15%", width: "50px", height: "50px", animationDelay: "0s" }} />
      <FloatingShape style={{ bottom: "30%", right: "20%", width: "60px", height: "60px", animationDelay: "2s" }} />
      <FloatingShape style={{ top: "70%", left: "10%", width: "40px", height: "40px", animationDelay: "4s" }} />

      <div style={mainContainerStyle}>
        {/* Sidebar Navigation */}
        <div style={sidebarStyle}>
          <div style={{
            textAlign: "center",
            marginBottom: "30px",
            padding: "20px",
          }}>
          </div>

          <nav>
            {navItems.map((item) => (
              <div
                key={item.id}
                style={navItemStyle(activeSection === item.id)}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={(e) => handleNavHover(e)}
                onMouseLeave={(e) => handleNavLeave(e, activeSection === item.id)}
              >
                {item.label}
              </div>
            ))}
          </nav>

          {/* User Info Card */}
          {user && (
            <div style={{
              marginTop: "30px",
              padding: "16px",
              backgroundColor: "rgba(16, 185, 129, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(16, 185, 129, 0.1)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}>
                Welcome back!
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "400",
              }}>
                {user.name || "User"}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={contentAreaStyle}>

          {loading ? (
            <div style={loadingContainerStyle}>
              <Spinner animation="border" style={{ 
                color: "#8b5cf6", 
                width: "4rem", 
                height: "4rem",
                borderWidth: "4px"
              }} />
              <div style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#6b7280",
              }}>
                🔍 Finding amazing people for you...
              </div>
            </div>
          ) : (
            <>
              {/* For You Section */}
              <section id="for-you">
                <h2 style={sectionTitleStyle}>🎯 For You</h2>
                <div style={profileCardsContainerStyle}>
                  {discoverUsers && discoverUsers.length > 0 ? (
                    discoverUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={user?.rating || 5}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <div style={noUsersMessageStyle}>
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                      <div>No personalized recommendations available yet</div>
                      <div style={{ fontSize: "1rem", marginTop: "8px", opacity: 0.8 }}>
                        Check back soon for curated matches!
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Popular Section */}
              <section id="popular">
                <h2 style={sectionTitleStyle}>🔥 Popular</h2>
                <p style={{
                  fontSize: "1.1rem",
                  color: "#6b7280",
                  marginBottom: "30px",
                  fontWeight: "500",
                }}>
                  Discover the most sought-after mentors and peers in various fields
                </p>
              </section>

              {/* Web Development Section */}
              <section id="web-development">
                <h3 style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  💻 Web Development
                </h3>
                <div style={profileCardsContainerStyle}>
                  {webDevUsers && webDevUsers.length > 0 ? (
                    webDevUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <div style={noUsersMessageStyle}>
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💻</div>
                      <div>No web developers available right now</div>
                      <div style={{ fontSize: "1rem", marginTop: "8px", opacity: 0.8 }}>
                        New developers join daily!
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Machine Learning Section */}
              <section id="machine-learning">
                <h3 style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  🤖 Machine Learning & AI
                </h3>
                <div style={profileCardsContainerStyle}>
                  {mlUsers && mlUsers.length > 0 ? (
                    mlUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <div style={noUsersMessageStyle}>
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤖</div>
                      <div>No ML experts available at the moment</div>
                      <div style={{ fontSize: "1rem", marginTop: "8px", opacity: 0.8 }}>
                        AI enthusiasts are joining soon!
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Others Section */}
              <section id="others">
                <h3 style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  🌟 Other Skills
                </h3>
                <div style={profileCardsContainerStyle}>
                  {otherUsers && otherUsers.length > 0 ? (
                    otherUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <div style={noUsersMessageStyle}>
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🌟</div>
                      <div>No other specialists available currently</div>
                      <div style={{ fontSize: "1rem", marginTop: "8px", opacity: 0.8 }}>
                        Diverse talents are joining every day!
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.6;
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

        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        * {
          font-family: "Inter", sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 4px;
          border: 2px solid #000;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 1200px) {
          .main-container {
            flex-direction: column;
            gap: 20px;
          }
          
          .sidebar {
            width: 100% !important;
            position: static !important;
            display: flex;
            overflow-x: auto;
            padding: 20px !important;
          }
          
          .sidebar nav {
            display: flex !important;
            gap: 10px;
            min-width: max-content;
          }
          
          .nav-item {
            white-space: nowrap;
            min-width: 120px;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem !important;
          }
          
          .section-title {
            font-size: 2rem !important;
          }
          
          .profile-cards-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .main-container {
            padding: 10px !important;
          }
          
          .content-area, .sidebar {
            padding: 20px !important;
            margin: 0 !important;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2rem !important;
          }
          
          .section-title {
            font-size: 1.5rem !important;
          }
          
          .nav-item {
            padding: 12px 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Discover;