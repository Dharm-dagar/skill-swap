import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeSkill, setActiveSkill] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Search-related state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    category: "all",
    sortBy: "relevance",
    limit: 10,
  });

  // Base API URL - using your environment variables
  const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_LOCALHOST || "http://localhost:8000"}/user`;

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch trending skills on component mount
  useEffect(() => {
    fetchTrendingSkills();
  }, []);

  // Fetch trending skills
  const fetchTrendingSkills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending-skills?limit=14`);
      const data = await response.json();
      if (data.success) {
        setTrendingSkills(data.data.skills.map((skill) => skill.skill));
      }
    } catch (error) {
      console.error("Error fetching trending skills:", error);
      // Fallback to default skills
      setTrendingSkills([
        "JavaScript",
        "Photography",
        "Guitar",
        "Cooking",
        "UI/UX Design",
        "React",
        "Python",
        "Video Editing",
        "Digital Marketing",
        "Yoga",
        "Data Science",
        "Blockchain",
        "Mobile Apps",
        "Creative Writing",
      ]);
    }
  };

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search users
  const searchUsers = async (query, category = "all", sortBy = "relevance") => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        category,
        sortBy,
        limit: searchFilters.limit,
      });

      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.users);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get skill suggestions
  const getSkillSuggestions = async (input) => {
    if (!input || input.trim().length < 1) {
      setSkillSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/skill-suggestions?input=${encodeURIComponent(input.trim())}&limit=5`
      );
      const data = await response.json();

      if (data.success) {
        setSkillSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching skill suggestions:", error);
      setSkillSuggestions([]);
    }
  };

  // Debounced versions
  const debouncedSearch = useCallback(debounce(searchUsers, 500), [searchFilters]);
  const debouncedSuggestions = useCallback(debounce(getSkillSuggestions, 300), []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Trigger search and suggestions
    debouncedSearch(value, searchFilters.category, searchFilters.sortBy);
    debouncedSuggestions(value);
  };

  // Handle search button click
  const handleSearch = () => {
    if (inputValue.trim()) {
      searchUsers(inputValue, searchFilters.category, searchFilters.sortBy);
    }
  };

  // Enhanced event handlers (keeping existing ones)
  const handleButtonHover = (e) => {
    e.target.style.transform = "translate(-3px, -3px)";
    e.target.style.boxShadow = "9px 9px 0px #000";
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
    e.target.style.transform = "translate(-3px, -3px)";
    e.target.style.boxShadow = "9px 9px 0px #000";
  };

  const handleFeatureHover = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  };

  const handleFeatureLeave = (e) => {
    e.currentTarget.style.transform = "translate(0, 0)";
    e.currentTarget.style.boxShadow = "8px 8px 0px #000";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  };

  const handleFeatureMouseDown = (e) => {
    e.currentTarget.style.transform = "translate(4px, 4px)";
    e.currentTarget.style.boxShadow = "4px 4px 0px #000";
  };

  const handleFeatureMouseUp = (e) => {
    e.currentTarget.style.transform = "translate(-4px, -4px)";
    e.currentTarget.style.boxShadow = "12px 12px 0px #000";
  };

  const handleSkillClick = (skill) => {
    setActiveSkill(skill);
    setInputValue(skill);
    searchUsers(skill, searchFilters.category, searchFilters.sortBy);
    setTimeout(() => setActiveSkill(null), 2000);
  };

  // Styles (keeping existing ones and adding new ones)
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
    position: "relative",
    overflow: "hidden",
  };

  const heroSectionStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "120px 40px 100px",
    textAlign: "center",
    position: "relative",
    zIndex: 5,
  };

  const mainTitleStyle = {
    fontSize: "4.5rem",
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: "30px",
    letterSpacing: "-3px",
    lineHeight: "1.1",
    textShadow: "3px 3px 0px rgba(139, 92, 246, 0.1)",
  };

  const subtitleStyle = {
    fontSize: "1.4rem",
    color: "#4a4a4a",
    maxWidth: "750px",
    marginBottom: "60px",
    lineHeight: "1.7",
    fontWeight: "500",
  };

  const searchContainerStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "800px",
    marginBottom: "30px",
  };

  const inputContainerStyle = {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "center",
    minHeight: "80px",
    position: "relative",
  };

  const inputStyle = {
    padding: "18px 25px",
    fontSize: "1.1rem",
    borderRadius: "16px",
    border: `4px solid ${isInputFocused ? "#8b5cf6" : "#000"}`,
    boxShadow: `6px 6px 0px #000`,
    backgroundColor: "white",
    minWidth: "520px",
    outline: "none",
    transform: "translate(0, 0)",
    transition: "all 0.2s ease",
    fontWeight: "500",
  };

  const ctaButtonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "4px solid #000",
    padding: "18px 45px",
    fontSize: "1.2rem",
    fontWeight: "700",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "6px 6px 0px #000",
    transform: "translate(0, 0)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  // Search-specific styles
  const searchResultsStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    backgroundColor: "white",
    border: "4px solid #000",
    borderRadius: "20px",
    boxShadow: "8px 8px 0px #000",
    maxHeight: "500px",
    overflowY: "auto",
    zIndex: 1000,
    marginTop: "15px",
  };

  const searchResultItemStyle = {
    padding: "20px 25px",
    borderBottom: "2px solid #f0f0f0",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
  };

  const suggestionStyle = {
    padding: "15px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#475569",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const filtersStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "16px",
    border: "3px solid #000",
    boxShadow: "4px 4px 0px #000",
    backdropFilter: "blur(10px)",
  };

  const filterButtonStyle = (isActive) => ({
    padding: "12px 20px",
    border: "3px solid #000",
    borderRadius: "12px",
    backgroundColor: isActive ? "#8b5cf6" : "white",
    color: isActive ? "white" : "#2d2d2d",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: isActive ? "3px 3px 0px #000" : "2px 2px 0px #000",
    transform: isActive ? "translate(1px, 1px)" : "translate(0, 0)",
  });

  const loadingStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    color: "#666",
    fontSize: "1.1rem",
    fontWeight: "500",
  };

  const noResultsStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    color: "#666",
    textAlign: "center",
  };

  const skillsContainerStyle = {
    marginBottom: "60px",
    minHeight: "120px",
  };

  const skillButtonsContainerStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    maxWidth: "900px",
  };

  const getSkillButtonStyle = (skill) => ({
    backgroundColor: activeSkill === skill ? "#8b5cf6" : "#ffffff",
    color: activeSkill === skill ? "white" : "#2d2d2d",
    border: "3px solid #000",
    padding: "12px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "4px 4px 0px #000",
    transition: "all 0.2s ease",
    transform: "translate(0, 0)",
    margin: "4px",
  });

  const featuresSectionStyle = {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: "100px 40px",
    position: "relative",
  };

  const sectionTitleStyle = {
    fontSize: "3.5rem",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "80px",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-2px",
  };

  const featuresGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    alignItems: "start",
  };

  const featureCardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#2d2d2d",
    padding: "40px",
    borderRadius: "20px",
    border: "4px solid #000",
    boxShadow: "8px 8px 0px #000",
    transition: "all 0.2s ease",
    transform: "translate(0, 0)",
    margin: "5px",
    position: "relative",
    overflow: "hidden",
  };

  const featureNumberStyle = {
    display: "inline-block",
    width: "50px",
    height: "50px",
    backgroundColor: "#8b5cf6",
    color: "white",
    borderRadius: "50%",
    textAlign: "center",
    lineHeight: "50px",
    fontSize: "1.4rem",
    fontWeight: "900",
    marginBottom: "25px",
    border: "3px solid #000",
    boxShadow: "3px 3px 0px #000",
  };

  const featureTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#8b5cf6",
  };

  const featureDescStyle = {
    lineHeight: "1.7",
    color: "#4a4a4a",
    fontSize: "1.05rem",
  };

  const statsStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    marginBottom: "50px",
    flexWrap: "wrap",
  };

  const statItemStyle = {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "3px solid rgba(255, 255, 255, 0.2)",
    minWidth: "150px",
  };

  const statNumberStyle = {
    fontSize: "2.5rem",
    fontWeight: "900",
    color: "#8b5cf6",
    display: "block",
  };

  const statLabelStyle = {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  };

  // Enhanced star decorations
  const StarDecoration = ({ style }) => (
    <div
      style={{
        position: "absolute",
        fontSize: "2.5rem",
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        opacity: 0.8,
        animation: "sparkle 4s ease-in-out infinite",
        pointerEvents: "none",
        ...style,
      }}
    >
      ✦
    </div>
  );

  // Floating shapes
  const FloatingShape = ({ style, children }) => (
    <div
      style={{
        position: "absolute",
        border: "3px solid rgba(139, 92, 246, 0.3)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );

  const features = [
    {
      number: "1",
      title: "Learn From Industry Experts",
      description:
        "Connect with seasoned professionals and gain practical, real-world knowledge. Master programming languages, creative skills, business strategies, and more through personalized mentorship.",
    },
    {
      number: "2",
      title: "Become a Mentor & Earn",
      description:
        "Transform your expertise into income while making a difference. Share your knowledge, build your reputation, and create lasting impact in your field of expertise.",
    },
    {
      number: "3",
      title: "Collaborative Learning Hub",
      description:
        "Join a vibrant community of learners and creators. Participate in group challenges, collaborative projects, and peer-to-peer learning experiences that accelerate growth.",
    },
    {
      number: "4",
      title: "Unlimited Learning Paths",
      description:
        "Explore thousands of skills across technology, creative arts, business, and lifestyle categories. From beginner-friendly basics to advanced masterclasses.",
    },
    {
      number: "5",
      title: "Track Your Progress",
      description:
        "Set goals, monitor achievements, and celebrate milestones. Our intelligent tracking system helps you stay motivated and see your continuous improvement.",
    },
  ];

  const categories = [
    { key: "all", label: "All" },
    { key: "skills", label: "Skills" },
    { key: "name", label: "Names" },
    { key: "bio", label: "Bio" },
    { key: "projects", label: "Projects" },
    { key: "education", label: "Education" },
  ];

  const sortOptions = [
    { key: "relevance", label: "Relevance" },
    { key: "rating", label: "Rating" },
    { key: "recent", label: "Recent" },
    { key: "name", label: "Name" },
  ];

  return (
    <div style={containerStyle}>
      {/* Enhanced Decorative Elements */}
      <StarDecoration style={{ top: "8%", left: "8%", animationDelay: "0s" }} />
      <StarDecoration style={{ top: "15%", right: "12%", animationDelay: "1.5s" }} />
      <StarDecoration style={{ top: "70%", left: "3%", animationDelay: "3s" }} />
      <StarDecoration style={{ bottom: "15%", right: "8%", animationDelay: "0.8s" }} />

      <FloatingShape style={{ top: "20%", left: "20%", width: "60px", height: "60px", animationDelay: "0s" }} />
      <FloatingShape style={{ top: "60%", right: "25%", width: "40px", height: "40px", animationDelay: "2s" }} />
      <FloatingShape style={{ bottom: "30%", left: "15%", width: "80px", height: "80px", animationDelay: "4s" }} />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <h1 style={mainTitleStyle}>
          The Ultimate Platform for{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Skill Exchange
          </span>
        </h1>
        <p style={subtitleStyle}>
          Transform your knowledge into opportunities. Learn from experts, teach your skills, and join a thriving
          community of lifelong learners and innovators.
        </p>

        {/* Search Filters */}
        <div style={filtersStyle}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              style={filterButtonStyle(searchFilters.category === cat.key)}
              onClick={() => {
                setSearchFilters((prev) => ({ ...prev, category: cat.key }));
                if (inputValue.trim()) {
                  searchUsers(inputValue, cat.key, searchFilters.sortBy);
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Enhanced Search Section */}
        <div style={searchContainerStyle}>
          <div style={inputContainerStyle}>
            <div style={{ position: "relative", flex: "1", minWidth: "520px" }}>
              <input
                type="text"
                placeholder="What skill would you like to learn or teach?"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                style={inputStyle}
              />

              {/* Skill Suggestions Dropdown */}
              {isInputFocused && skillSuggestions.length > 0 && (
                <div style={{ ...searchResultsStyle, maxHeight: "250px", backgroundColor: "#fafbfc" }}>
                  <div
                    style={{
                      padding: "15px 20px",
                      borderBottom: "2px solid #e2e8f0",
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    💡 Skill Suggestions
                  </div>
                  {skillSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      style={suggestionStyle}
                      onClick={() => {
                        setInputValue(suggestion.skill);
                        setSkillSuggestions([]);
                        searchUsers(suggestion.skill, searchFilters.category, searchFilters.sortBy);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e2e8f0";
                        e.target.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f8fafc";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>🎯</span>
                      <span style={{ fontWeight: "600", color: "#334155" }}>{suggestion.skill}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          backgroundColor: "#e2e8f0",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {suggestion.count} users
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              style={ctaButtonStyle}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              onMouseDown={handleButtonMouseDown}
              onMouseUp={handleButtonMouseUp}
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {showResults && (
            <div style={searchResultsStyle}>
              {isSearching ? (
                <div style={loadingStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "3px solid #8b5cf6",
                        borderTop: "3px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    <span>Searching for amazing people...</span>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div
                    style={{
                      padding: "20px 25px",
                      borderBottom: "3px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                      fontSize: "0.9rem",
                      color: "#64748b",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🎯 Found {searchResults.length} talented people
                  </div>
                  {searchResults.map((user, index) => (
                    <div
                      key={user._id || index}
                      style={{
                        ...searchResultItemStyle,
                        background: index % 2 === 0 ? "white" : "#fafbfc",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.borderLeft = "4px solid #8b5cf6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#fafbfc";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.borderLeft = "none";
                      }}
                      onClick={() => {
                        console.log("Navigate to user:", user.username);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "1.4rem",
                            border: "3px solid #000",
                            boxShadow: "3px 3px 0px #000",
                            flexShrink: 0,
                          }}
                        >
                          {user.name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                            <h4
                              style={{
                                margin: "0",
                                fontWeight: "700",
                                color: "#1e293b",
                                fontSize: "1.1rem",
                              }}
                            >
                              {user.name || user.username}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                backgroundColor: "#fef3c7",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: "#92400e",
                              }}
                            >
                              ⭐ {user.rating || 0}/5
                            </div>
                          </div>
                          <p
                            style={{
                              margin: "0 0 10px 0",
                              color: "#64748b",
                              fontSize: "0.9rem",
                              fontWeight: "500",
                            }}
                          >
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p
                              style={{
                                margin: "0 0 12px 0",
                                color: "#475569",
                                fontSize: "0.9rem",
                                lineHeight: "1.5",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {user.bio}
                            </p>
                          )}
                          {user.skillsProficientAt?.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                              {user.skillsProficientAt.slice(0, 4).map((skill, i) => (
                                <span
                                  key={i}
                                  style={{
                                    backgroundColor: "#e0f2fe",
                                    color: "#0277bd",
                                    padding: "4px 12px",
                                    borderRadius: "16px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    border: "2px solid #0277bd",
                                    boxShadow: "1px 1px 0px #0277bd",
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skillsProficientAt.length > 4 && (
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#64748b",
                                    fontWeight: "500",
                                    alignSelf: "center",
                                  }}
                                >
                                  +{user.skillsProficientAt.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: "10px",
                            }}
                          >
                            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                              {user.relevanceScore && (
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#8b5cf6",
                                    fontWeight: "600",
                                    backgroundColor: "#f3e8ff",
                                    padding: "2px 8px",
                                    borderRadius: "8px",
                                  }}
                                >
                                  Match: {user.relevanceScore.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <button
                              style={{
                                backgroundColor: "#8b5cf6",
                                color: "white",
                                border: "2px solid #000",
                                padding: "6px 16px",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: "2px 2px 0px #000",
                                transition: "all 0.2s ease",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${user.username}`);
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translate(-1px, -1px)";
                                e.target.style.boxShadow = "3px 3px 0px #000";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translate(0, 0)";
                                e.target.style.boxShadow = "2px 2px 0px #000";
                              }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={noResultsStyle}>
                  <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔍</div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#374151", fontWeight: "600" }}>No matches found</h3>
                  <p style={{ margin: "0", color: "#6b7280", fontSize: "0.95rem" }}>
                    Try different keywords or browse our trending skills below
                  </p>
                  <button
                    style={{
                      marginTop: "20px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "2px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowResults(false);
                      setInputValue("");
                      setSearchResults([]);
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Options */}
        {showResults && (
          <div style={{ ...filtersStyle, marginTop: "20px" }}>
            <span style={{ color: "#666", fontSize: "0.9rem", alignSelf: "center" }}>Sort by:</span>
            {sortOptions.map((option) => (
              <button
                key={option.key}
                style={filterButtonStyle(searchFilters.sortBy === option.key)}
                onClick={() => {
                  setSearchFilters((prev) => ({ ...prev, sortBy: option.key }));
                  if (inputValue.trim()) {
                    searchUsers(inputValue, searchFilters.category, option.key);
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Enhanced Skills Section - Only show when no search results */}
        {!showResults && (
          <div style={skillsContainerStyle}>
            <p style={{ color: "#4a4a4a", marginBottom: "25px", fontSize: "1.1rem", fontWeight: "600" }}>
              🔥 Trending Skills:
            </p>
            <div style={skillButtonsContainerStyle}>
              {trendingSkills.map((skill) => (
                <button
                  key={skill}
                  style={getSkillButtonStyle(skill)}
                  onClick={() => handleSkillClick(skill)}
                  onMouseEnter={(e) => {
                    if (activeSkill !== skill) {
                      e.target.style.transform = "translate(-2px, -2px)";
                      e.target.style.boxShadow = "6px 6px 0px #000";
                      e.target.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSkill !== skill) {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "4px 4px 0px #000";
                      e.target.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section style={featuresSectionStyle} id="features">
        {/* Stats Section */}
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>10K+</span>
            <span style={statLabelStyle}>Active Learners</span>
          </div>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>500+</span>
            <span style={statLabelStyle}>Expert Mentors</span>
          </div>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>50+</span>
            <span style={statLabelStyle}>Skill Categories</span>
          </div>
        </div>

        <h2 style={sectionTitleStyle}>WHY CHOOSE SKILL SWAP?</h2>
        <div style={featuresGridStyle}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={featureCardStyle}
              onMouseEnter={handleFeatureHover}
              onMouseLeave={handleFeatureLeave}
              onMouseDown={handleFeatureMouseDown}
              onMouseUp={handleFeatureMouseUp}
            >
              <div style={featureNumberStyle}>{feature.number}</div>
              <h3 style={featureTitleStyle}>{feature.title}</h3>
              <p style={featureDescStyle}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

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
        
        @media (max-width: 768px) {
          input {
            min-width: 300px !important;
          }
        }

        /* Custom scrollbar for search results */
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
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }

        /* Loading animation */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .loading {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Hover effects for interactive elements */
        .search-result-item:hover {
          background-color: #f8fafc !important;
          transform: translateX(5px);
        }

        .suggestion-item:hover {
          background-color: #e0e0e0 !important;
        }

        /* Focus styles for accessibility */
        input:focus {
          outline: 3px solid rgba(139, 92, 246, 0.3);
          outline-offset: 2px;
        }

        button:focus {
          outline: 3px solid rgba(139, 92, 246, 0.3);
          outline-offset: 2px;
        }

        /* Responsive design improvements */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 3rem !important;
          }
          
          .search-container {
            padding: 0 20px;
          }
          
          .input-container {
            flex-direction: column;
            align-items: center;
          }
          
          .search-input {
            min-width: 90% !important;
          }
          
          .filters-container {
            flex-wrap: wrap;
            gap: 8px !important;
          }
          
          .skill-buttons {
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2.5rem !important;
            letter-spacing: -1px !important;
          }
          
          .subtitle {
            font-size: 1.2rem !important;
          }
          
          .hero-section {
            padding: 80px 20px 60px !important;
          }
          
          .features-section {
            padding: 60px 20px !important;
          }
          
          .section-title {
            font-size: 2.5rem !important;
          }
        }

        /* Animation for search results appearance */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .search-results {
          animation: slideDown 0.3s ease-out;
        }

        /* Skill button active state animation */
        @keyframes skillPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .skill-active {
          animation: skillPulse 0.6s ease-in-out;
        }

        /* Enhanced button states */
        .cta-button:active {
          transform: translate(3px, 3px) !important;
          box-shadow: 3px 3px 0px #000 !important;
        }

        .filter-button:active {
          transform: translate(1px, 1px) !important;
        }

        /* Gradient text animation */
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradient-text {
          background: linear-gradient(-45deg, #8b5cf6, #06b6d4, #10b981, #f59e0b);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Enhanced shadow effects */
        .neo-shadow {
          box-shadow: 
            6px 6px 0px #000,
            6px 6px 0px 2px rgba(139, 92, 246, 0.1);
        }

        .neo-shadow:hover {
          box-shadow: 
            9px 9px 0px #000,
            9px 9px 0px 2px rgba(139, 92, 246, 0.1);
        }

        /* Search result item animation */
        .search-result-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-result-item:hover {
          transform: translateX(5px) !important;
          box-shadow: -4px 0px 0px rgba(139, 92, 246, 0.2);
        }

        /* Loading dots animation */
        @keyframes loadingDots {
          0%, 20% {
            color: rgba(139, 92, 246, 0.4);
          }
          50% {
            color: rgba(139, 92, 246, 1);
          }
          80%, 100% {
            color: rgba(139, 92, 246, 0.4);
          }
        }

        .loading-dots span:nth-child(1) { animation-delay: 0s; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        
        .loading-dots span {
          animation: loadingDots 1.4s infinite ease-in-out;
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .search-input,
          .cta-button,
          .filter-button,
          .skill-button {
            border-width: 3px !important;
          }
          
          .search-results {
            border-width: 3px !important;
          }
        }

        /* Focus indicators for keyboard navigation */
        .search-result-item:focus,
        .suggestion-item:focus {
          outline: 3px solid #8b5cf6;
          outline-offset: 2px;
          background-color: #f8fafc;
        }

        /* Print styles */
        @media print {
          .search-results,
          .filters-container,
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
