import React, { useState } from "react";

const Login = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isLoginBoxHovered, setIsLoginBoxHovered] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  // Event handlers for button interactions
  const handleButtonHover = (e) => {
    e.target.style.transform = "translate(-2px, -2px)";
    e.target.style.boxShadow = "8px 8px 0px #000";
    e.target.style.backgroundColor = "#7c3aed";
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = "translate(0, 0)";
    e.target.style.boxShadow = "6px 6px 0px #000";
    e.target.style.backgroundColor = "#8b5cf6";
  };

  const handleButtonMouseDown = (e) => {
    e.target.style.transform = "translate(3px, 3px)";
    e.target.style.boxShadow = "3px 3px 0px #000";
  };

  const handleButtonMouseUp = (e) => {
    e.target.style.transform = "translate(-2px, -2px)";
    e.target.style.boxShadow = "8px 8px 0px #000";
  };

  // Event handlers for login box interactions
  const handleLoginBoxHover = (e) => {
    e.currentTarget.style.transform = "translate(-3px, -3px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
  };

  const handleLoginBoxLeave = (e) => {
    e.currentTarget.style.transform = "translate(0, 0)";
    e.currentTarget.style.boxShadow = "8px 8px 0px #000";
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
    position: "relative",
    overflow: "hidden",
  };

  const loginBoxStyle = {
    display: "flex",
    backgroundColor: "#ffffff",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 50px",
    border: "4px solid #000",
    borderRadius: "16px",
    boxShadow: "8px 8px 0px #000",
    zIndex: "999",
    transition: "all 0.2s ease",
    transform: "translate(0, 0)",
    minWidth: "400px",
    gap: "30px",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: "-1px",
    margin: 0,
  };

  const subtitleStyle = {
    fontSize: "1rem",
    color: "#4a4a4a",
    textAlign: "center",
    margin: "0 0 10px 0",
    fontWeight: "400",
  };

  const buttonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "3px solid #000",
    padding: "12px 24px",
    fontSize: "0.95rem",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "6px 6px 0px #000",
    transform: "translate(0, 0)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "200px",
    justifyContent: "center",
  };

  // Decorative elements
  const StarDecoration = ({ style }) => (
    <div
      style={{
        position: "absolute",
        fontSize: "2rem",
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        opacity: 0.7,
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

  // Google Icon SVG (since we don't have react-icons)
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div style={containerStyle}>
      {/* Decorative Elements */}
      <StarDecoration style={{ top: "10%", left: "15%", animationDelay: "0s" }} />
      <StarDecoration style={{ top: "20%", right: "20%", animationDelay: "1.5s" }} />
      <StarDecoration style={{ bottom: "15%", left: "10%", animationDelay: "3s" }} />
      <StarDecoration style={{ bottom: "25%", right: "15%", animationDelay: "0.8s" }} />
      
      <FloatingShape style={{ top: "15%", left: "10%", width: "60px", height: "60px", animationDelay: "0s" }} />
      <FloatingShape style={{ top: "70%", right: "10%", width: "40px", height: "40px", animationDelay: "2s" }} />
      <FloatingShape style={{ bottom: "20%", left: "20%", width: "80px", height: "80px", animationDelay: "4s" }} />

      {/* Main Login Card */}
      <div 
        style={loginBoxStyle}
        onMouseEnter={handleLoginBoxHover}
        onMouseLeave={handleLoginBoxLeave}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={titleStyle}>Welcome Back!</h1>
          <p style={subtitleStyle}>Sign in to continue your learning journey</p>
        </div>

        <button
          style={buttonStyle}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          onMouseDown={handleButtonMouseDown}
          onMouseUp={handleButtonMouseUp}
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
          }
          33% { 
            transform: translateY(-15px) rotate(120deg);
          }
          66% { 
            transform: translateY(-8px) rotate(240deg);
          }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Login;