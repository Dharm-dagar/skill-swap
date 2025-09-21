import React, { useEffect, useState } from "react";
import { useUser } from "../../util/UserContext.jsx";

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/auth/logout");
      onLogout();
      window.location.href = "/login";
    } catch (error) {
      console.log(error);
    }
    setIsOpen(false);
  };

  const toggleStyle = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.15)",
    transition: "all 0.2s ease",
    textDecoration: "none",
    color: "#374151",
  };

  const avatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    overflow: "hidden",
    marginRight: "8px",
    border: "2px solid rgba(139, 92, 246, 0.2)",
  };

  const dropdownMenuStyle = {
    position: "absolute",
    top: "100%",
    right: "0",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    minWidth: "150px",
    zIndex: 1000,
    marginTop: "8px",
    overflow: "hidden",
  };

  const dropdownItemStyle = {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    transition: "all 0.2s ease",
    textDecoration: "none",
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={toggleStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.05)";
          e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  {user ? (
    <>
      {user.picture ? (
        <img
          src={user.picture}
          alt={user.username || user.name}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(139,92,246,0.2)"
          }}
        />
      ) : (
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize: "14px",
          textTransform: "uppercase",
          border: "2px solid rgba(139,92,246,0.2)"
        }}>
          {(user.name || user.username || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <span style={{ fontWeight: "600", fontSize: "14px" }}>
        {user.username || user.name}
      </span>
    </>
  ) : "User"}
</div>

        <span style={{ fontSize: "12px", color: "#6b7280" }}>▼</span>
      </div>

      {isOpen && (
        <div style={dropdownMenuStyle}>
          <a
            href="/edit_profile"
            style={dropdownItemStyle}
            onClick={() => setIsOpen(false)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
              e.target.style.color = "#8b5cf6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#4b5563";
            }}
          >
            Profile
          </a>
          <button
            style={dropdownItemStyle}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              e.target.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#4b5563";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({ isOpen, user, onLogout, discover, onClose }) => {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "all 0.3s ease",
  };

  const menuStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "300px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRight: "none",
    boxShadow: "-4px 0px 20px rgba(0, 0, 0, 0.1)",
    padding: "80px 30px 30px",
    transform: isOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s ease",
    zIndex: 1000,
    overflow: "auto",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
    color: "#6b7280",
  };

  const mobileLinkStyle = {
    display: "block",
    color: "#374151",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    padding: "12px 16px",
    margin: "8px 0",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    textAlign: "left",
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={menuStyle}>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.target.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            e.target.style.color = "#6b7280";
          }}
        >
          ×
        </button>

        <a
          href="/"
          style={mobileLinkStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
            e.target.style.color = "#8b5cf6";
            e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            e.target.style.color = "#374151";
            e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
          }}
        >
          Home
        </a>

        {user ? (
          <>
            <a
              href="/discover"
              style={mobileLinkStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#374151";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              Discover
            </a>
            <a
              href="/chats"
              style={mobileLinkStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#374151";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              Your Chats
            </a>
            <a
              href="/edit_profile"
              style={mobileLinkStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#374151";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              Edit Profile
            </a>

            {discover && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ 
                  color: "#374151", 
                  marginBottom: "15px", 
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: "600"
                }}>
                  Discover Sections
                </h3>
                {["For You", "Popular", "Web Development", "Machine Learning", "Others"].map((section) => (
                  <a
                    key={section}
                    href={`#${section.toLowerCase().replace(" ", "-")}`}
                    style={{
                      ...mobileLinkStyle,
                      fontSize: "14px",
                      backgroundColor: "rgba(249, 250, 251, 0.8)",
                      color: "#6b7280",
                    }}
                    onClick={onClose}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                      e.target.style.color = "#8b5cf6";
                      e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "rgba(249, 250, 251, 0.8)";
                      e.target.style.color = "#6b7280";
                      e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                    }}
                  >
                    {section}
                  </a>
                ))}
              </div>
            )}

            <div style={{ marginTop: "30px" }}>
              <UserProfileDropdown user={user} onLogout={onLogout} />
            </div>
          </>
        ) : (
          <>
            <a
              href="/about_us"
              style={mobileLinkStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#374151";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              About Us
            </a>
            <a
              href="/#why-skill-swap"
              style={mobileLinkStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#374151";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              Why SkillSwap
            </a>
            <a
              href="/login"
              style={{
                ...mobileLinkStyle,
                backgroundColor: "#8b5cf6",
                color: "white",
                borderColor: "#8b5cf6",
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#7c3aed";
                e.target.style.borderColor = "#7c3aed";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#8b5cf6";
                e.target.style.borderColor = "#8b5cf6";
              }}
            >
              Login/Register
            </a>
          </>
        )}
      </div>
    </>
  );
};

const Header = () => {
  const { user, setUser } = useUser();
  const [discover, setDiscover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // useEffect(() => {
  //   // Simulate user data - replace with actual user context
  //   const userData = {
  //     username: "User",
  //     picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  //   };
  //   setUser(userData);
  // }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const temp = window.location.href.split("/");
      const url = temp.pop();
      setDiscover(url.startsWith("discover"));
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  const navbarStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "none",
    borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
    boxShadow: "0 2px 20px rgba(0, 0, 0, 0.08)",
    padding: "16px 30px",
    position: "sticky",
    top: 0,
    zIndex: 998,
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const logoStyle = {
    fontSize: "1.8rem",
    fontWeight: "800",
    textDecoration: "none",
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
  };

  const brandText1 = {
    color: "#374151",
  };

  const brandText2 = {
    color: "#8b5cf6",
  };

  const desktopNavStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const navLinkStyle = {
    color: "#4b5563",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    display: "inline-block",
  };

  const primaryNavLinkStyle = {
    ...navLinkStyle,
    backgroundColor: "#8b5cf6",
    color: "white",
    borderColor: "#8b5cf6",
  };

  const mobileToggleStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "8px",
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    display: "none",
    color: "#6b7280",
  };

  return (
    <>
      <nav style={navbarStyle}>
        <div style={containerStyle}>
          <a href="/" style={logoStyle}>
            <span style={brandText1}>Skill</span>
            <span style={brandText2}>Swap</span>
          </a>

          {/* Desktop Navigation */}
          <div style={{ ...desktopNavStyle }} className="desktop-nav">
            <a
              href="/"
              style={navLinkStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                e.target.style.color = "#8b5cf6";
                e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                e.target.style.color = "#4b5563";
                e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
              }}
            >
              Home
            </a>

            {user ? (
              <>
                <a
                  href="/discover"
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                    e.target.style.color = "#8b5cf6";
                    e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                    e.target.style.color = "#4b5563";
                    e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                  }}
                >
                  Discover
                </a>
                <a
                  href="/chats"
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                    e.target.style.color = "#8b5cf6";
                    e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                    e.target.style.color = "#4b5563";
                    e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                  }}
                >
                  Your Chats
                </a>
                <a
                  href="/edit_profile"
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                    e.target.style.color = "#8b5cf6";
                    e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                    e.target.style.color = "#4b5563";
                    e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                  }}
                >
                  Edit Profile
                </a>
                <UserProfileDropdown user={user} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <a
                  href="/about_us"
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                    e.target.style.color = "#8b5cf6";
                    e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                    e.target.style.color = "#4b5563";
                    e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                  }}
                >
                  About Us
                </a>
                <a
                  href="/#why-skill-swap"
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                    e.target.style.color = "#8b5cf6";
                    e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                    e.target.style.color = "#4b5563";
                    e.target.style.borderColor = "rgba(229, 231, 235, 0.3)";
                  }}
                >
                  Why SkillSwap
                </a>
                <a
                  href="/login"
                  style={primaryNavLinkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#7c3aed";
                    e.target.style.borderColor = "#7c3aed";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#8b5cf6";
                    e.target.style.borderColor = "#8b5cf6";
                  }}
                >
                  Login/Register
                </a>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            style={mobileToggleStyle}
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
              e.target.style.color = "#8b5cf6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              e.target.style.color = "#6b7280";
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        user={user}
        onLogout={handleLogout}
        discover={discover}
        onClose={() => setMobileMenuOpen(false)}
      />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-toggle {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;