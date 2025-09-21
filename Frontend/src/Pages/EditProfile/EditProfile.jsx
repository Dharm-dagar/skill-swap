import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../util/UserContext";

// Decorative Components
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

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, setUser } = useUser();

  const [form, setForm] = useState({
    profilePhoto: null,
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);
  const [activeKey, setActiveKey] = useState("registration");

  useEffect(() => {
    if (user) {
      setLoading(true);
      setForm((prevState) => ({
        ...prevState,
        name: user?.name || "",
        email: user?.email || "",
        username: user?.username || "",
        skillsProficientAt: user?.skillsProficientAt || [],
        skillsToLearn: user?.skillsToLearn || [],
        portfolioLink: user?.portfolioLink || "",
        githubLink: user?.githubLink || "",
        linkedinLink: user?.linkedinLink || "",
        education: user?.education || [
          {
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          },
        ],
        bio: user?.bio || "",
        projects: user?.projects || [],
      }));
      setTechStack(user?.projects?.map(() => "Select some Tech Stack") || []);
      setLoading(false);
    }
  }, [user]);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
      document.getElementById(tabs[currentIndex + 1])?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFileChange = async (e) => {
    const data = new FormData();
    data.append("picture", e.target.files[0]);
    try {
      toast.info("Uploading your pic, please wait...");
      const response = await axios.post("/user/uploadPicture", data);
      toast.success("Picture uploaded successfully");
      setForm((prev) => ({
        ...prev,
        profilePhoto: response.data.data.url,
      }));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Upload failed");
      if (error?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 500) {
      toast.error("Bio must be less than 500 characters");
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsToLearn.includes(skillsToLearn)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsProficientAt.includes(skillsToLearn)) {
        toast.error("Skill already in proficient list");
        return;
      }
      setForm((prev) => ({
        ...prev,
        skillsToLearn: [...prev.skillsToLearn, skillsToLearn],
      }));
    } else {
      if (skillsProficientAt === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsProficientAt.includes(skillsProficientAt)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsToLearn.includes(skillsProficientAt)) {
        toast.error("Skill already in learn list");
        return;
      }
      setForm((prev) => ({
        ...prev,
        skillsProficientAt: [...prev.skillsProficientAt, skillsProficientAt],
      }));
    }
  };

  const handleRemoveSkill = (skill, temp) => {
    if (temp === "skills_proficient_at") {
      setForm((prev) => ({
        ...prev,
        skillsProficientAt: prev.skillsProficientAt.filter((item) => item !== skill),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        skillsToLearn: prev.skillsToLearn.filter((item) => item !== skill),
      }));
    }
  };

  const handleRemoveEducation = (id) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      ),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      ),
    }));
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is required");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Add at least one proficient skill");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Add at least one skill to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Provide at least one link (Portfolio, GitHub, LinkedIn)");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && !githubRegex.test(form.githubLink)) {
      toast.error("Invalid GitHub link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && !linkedinRegex.test(form.linkedinLink)) {
      toast.error("Invalid LinkedIn link");
      return false;
    }
    if (form.portfolioLink && !form.portfolioLink.includes("http")) {
      toast.error("Invalid portfolio link");
      return false;
    }
    return true;
  };

  const validateEduForm = () => {
    for (const [index, edu] of form.education.entries()) {
      if (!edu.institution) {
        toast.error(`Institution name required in education ${index + 1}`);
        return false;
      }
      if (!edu.degree) {
        toast.error(`Degree required in education ${index + 1}`);
        return false;
      }
      if (!edu.startDate) {
        toast.error(`Start date required in education ${index + 1}`);
        return false;
      }
      if (!edu.endDate) {
        toast.error(`End date required in education ${index + 1}`);
        return false;
      }
      if (!edu.score) {
        toast.error(`Score required in education ${index + 1}`);
        return false;
      }
    }
    return true;
  };

  const validateAddForm = () => {
    for (const [index, project] of form.projects.entries()) {
      if (!project.title) {
        toast.error(`Title required in project ${index + 1}`);
        return false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech stack required in project ${index + 1}`);
        return false;
      }
      if (!project.startDate) {
        toast.error(`Start date required in project ${index + 1}`);
        return false;
      }
      if (!project.endDate) {
        toast.error(`End date required in project ${index + 1}`);
        return false;
      }
      if (!project.projectLink) {
        toast.error(`Project link required in project ${index + 1}`);
        return false;
      }
      if (!project.description) {
        toast.error(`Description required in project ${index + 1}`);
        return false;
      }
      if (project.startDate > project.endDate) {
        toast.error(`Start date must be before end date in project ${index + 1}`);
        return false;
      }
      if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        toast.error(`Invalid project link in project ${index + 1}`);
        return false;
      }
    }
    if (!form.bio) {
      toast.error("Bio is required");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio must be less than 500 characters");
      return false;
    }
    return true;
  };

  const handleSaveRegistration = async () => {
    if (!validateRegForm()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveRegDetails", form);
      toast.success("Registration details saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving details");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveEducation = async () => {
    if (!validateRegForm() || !validateEduForm()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveEduDetail", form);
      toast.success("Education details saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving details");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAdditional = async () => {
    if (!validateRegForm() || !validateEduForm() || !validateAddForm()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveAddDetail", form);
      toast.success("Additional details saved");
      navigate("/discover");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving details");
    } finally {
      setSaveLoading(false);
    }
  };

  // Styles
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
    padding: "30px",
    minHeight: "calc(100vh - 40px)",
    width: "100%",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "40px",
  };

  const mainTitleStyle = {
    fontSize: "3.5rem",
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: "20px",
    letterSpacing: "-1.5px",
    lineHeight: "1.1",
    textShadow: "3px 3px 0px rgba(139, 92, 246, 0.1)",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const formCardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    padding: "20px",
    marginBottom: "20px",
  };

  const inputStyle = {
    borderRadius: "8px",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    padding: "10px",
    width: "100%",
    transition: "all 0.2s ease",
    fontSize: "14px",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
    cursor: "pointer",
  };

  const tabItemStyle = (isActive) => ({
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

  const loadingContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    flexDirection: "column",
    gap: "20px",
  };

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

  const tabs = [
    { id: "registration", label: "📋 Profile", emoji: "📋" },
    { id: "education", label: "🎓 Education", emoji: "🎓" },
    { id: "longer-tab", label: "🔧 Additional", emoji: "🔧" },
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
          <div style={{ textAlign: "center", marginBottom: "30px", padding: "20px" }}>
            <h1 style={mainTitleStyle}>Update Profile</h1>
          </div>
          <nav>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                id={tab.id}
                style={tabItemStyle(activeKey === tab.id)}
                onClick={() => setActiveKey(tab.id)}
                onMouseEnter={handleNavHover}
                onMouseLeave={(e) => handleNavLeave(e, activeKey === tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div style={contentAreaStyle}>
          {loading ? (
            <div style={loadingContainerStyle}>
              <Spinner
                animation="border"
                style={{
                  color: "#8b5cf6",
                  width: "4rem",
                  height: "4rem",
                  borderWidth: "4px",
                }}
              />
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                🔍 Loading your profile...
              </div>
            </div>
          ) : (
            <Tabs
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
              id="edit-profile-tabs"
              className="d-none"
            >
              <Tab eventKey="registration">
                <div style={formCardStyle}>
                  <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937", marginBottom: "20px" }}>
                    Profile Details
                  </h3>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      style={inputStyle}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Profile Photo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={inputStyle}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      style={inputStyle}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Enter your username"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>LinkedIn Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="linkedinLink"
                      value={form.linkedinLink}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Enter your LinkedIn link"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>GitHub Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="githubLink"
                      value={form.githubLink}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Enter your GitHub link"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Portfolio Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="portfolioLink"
                      value={form.portfolioLink}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder="Enter your portfolio link"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Skills Proficient At</Form.Label>
                    <Form.Select
                      value={skillsProficientAt}
                      onChange={(e) => setSkillsProficientAt(e.target.value)}
                      style={inputStyle}
                    >
                      <option>Select some skill</option>
                      {skills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="mt-2">
                      {form.skillsProficientAt.map((skill, index) => (
                        <Badge
                          key={index}
                          bg="secondary"
                          className="me-2 mb-2"
                          style={{ cursor: "pointer", fontSize: "12px" }}
                          onClick={() => handleRemoveSkill(skill, "skills_proficient_at")}
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                    <button
                      style={buttonStyle}
                      name="skill_proficient_at"
                      onClick={handleAddSkill}
                    >
                      Add Skill
                    </button>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Skills To Learn</Form.Label>
                    <Form.Select
                      value={skillsToLearn}
                      onChange={(e) => setSkillsToLearn(e.target.value)}
                      style={inputStyle}
                    >
                      <option>Select some skill</option>
                      {skills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="mt-2">
                      {form.skillsToLearn.map((skill, index) => (
                        <Badge
                          key={index}
                          bg="secondary"
                          className="me-2 mb-2"
                          style={{ cursor: "pointer", fontSize: "12px" }}
                          onClick={() => handleRemoveSkill(skill, "skills_to_learn")}
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                    <button
                      style={buttonStyle}
                      name="skill_to_learn"
                      onClick={handleAddSkill}
                    >
                      Add Skill
                    </button>
                  </Form.Group>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      style={buttonStyle}
                      onClick={handleSaveRegistration}
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <Spinner animation="border" size="sm" style={{ color: "white" }} />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button style={buttonStyle} onClick={handleNext}>
                      Next
                    </button>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="education">
                {form.education.map((edu, index) => (
                  <div style={formCardStyle} key={edu.id}>
                    {index !== 0 && (
                      <div className="d-flex justify-content-end">
                        <button
                          style={{ ...buttonStyle, background: "#ef4444" }}
                          onClick={() => handleRemoveEducation(edu.id)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                        Institution Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="institution"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle}
                        placeholder="Enter institution name"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Degree</Form.Label>
                      <Form.Control
                        type="text"
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle}
                        placeholder="Enter degree"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                        Grade/Percentage
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="score"
                        value={edu.score}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle}
                        placeholder="Enter grade/percentage"
                      />
                    </Form.Group>
                    <div className="row">
                      <Form.Group className="col-md-6 mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                          Start Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(e, index)}
                          style={inputStyle}
                        />
                      </Form.Group>
                      <Form.Group className="col-md-6 mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                          End Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(e, index)}
                          style={inputStyle}
                        />
                      </Form.Group>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                        Description
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        value={edu.description}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle}
                        placeholder="Enter description"
                      />
                    </Form.Group>
                  </div>
                ))}
                <div className="d-flex justify-content-center">
                  <button
                    style={buttonStyle}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        education: [
                          ...prev.education,
                          {
                            id: uuidv4(),
                            institution: "",
                            degree: "",
                            startDate: "",
                            endDate: "",
                            score: "",
                            description: "",
                          },
                        ],
                      }))
                    }
                  >
                    Add Education
                  </button>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <button
                    style={buttonStyle}
                    onClick={handleSaveEducation}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <Spinner animation="border" size="sm" style={{ color: "white" }} />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button style={buttonStyle} onClick={handleNext}>
                    Next
                  </button>
                </div>
              </Tab>
              <Tab eventKey="longer-tab">
                <div style={formCardStyle}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                      Bio (Max 500 Characters)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="bio"
                      value={form.bio}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, minHeight: "100px" }}
                      placeholder="Enter your bio"
                    />
                  </Form.Group>
                  <h4 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#1f2937", marginBottom: "20px" }}>
                    Projects
                  </h4>
                  {form.projects.map((project, index) => (
                    <div style={formCardStyle} key={project.id || index}>
                      <div className="d-flex justify-content-end">
                        <button
                          style={{ ...buttonStyle, background: "#ef4444" }}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              projects: prev.projects.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={project.title}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={inputStyle}
                          placeholder="Enter project title"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>Tech Stack</Form.Label>
                        <Form.Select
                          value={techStack[index] || "Select some Tech Stack"}
                          onChange={(e) =>
                            setTechStack((prev) =>
                              prev.map((item, i) => (i === index ? e.target.value : item))
                            )
                          }
                          style={inputStyle}
                        >
                          <option>Select some Tech Stack</option>
                          {skills.map((skill, i) => (
                            <option key={i} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </Form.Select>
                        <div className="mt-2">
                          {project.techStack.map((skill, i) => (
                            <Badge
                              key={i}
                              bg="secondary"
                              className="me-2 mb-2"
                              style={{ cursor: "pointer", fontSize: "12px" }}
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((item, i) =>
                                    i === index
                                      ? { ...item, techStack: item.techStack.filter((s) => s !== skill) }
                                      : item
                                  ),
                                }))
                              }
                            >
                              {skill} ✕
                            </Badge>
                          ))}
                        </div>
                        <button
                          style={buttonStyle}
                          onClick={() => {
                            if (techStack[index] === "Select some Tech Stack") {
                              toast.error("Select a tech stack to add");
                              return;
                            }
                            if (project.techStack.includes(techStack[index])) {
                              toast.error("Tech stack already added");
                              return;
                            }
                            setForm((prev) => ({
                              ...prev,
                              projects: prev.projects.map((item, i) =>
                                i === index ? { ...item, techStack: [...item.techStack, techStack[index]] } : item
                              ),
                            }));
                          }}
                        >
                          Add Tech Stack
                        </button>
                      </Form.Group>
                      <div className="row">
                        <Form.Group className="col-md-6 mb-3">
                          <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                            Start Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                            onChange={(e) => handleAdditionalChange(e, index)}
                            style={inputStyle}
                          />
                        </Form.Group>
                        <Form.Group className="col-md-6 mb-3">
                          <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                            End Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                            onChange={(e) => handleAdditionalChange(e, index)}
                            style={inputStyle}
                          />
                        </Form.Group>
                      </div>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                          Project Link
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="projectLink"
                          value={project.projectLink}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={inputStyle}
                          placeholder="Enter project link"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: "#8b5cf6", fontWeight: "600" }}>
                          Description
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="description"
                          value={project.description}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={inputStyle}
                          placeholder="Enter project description"
                        />
                      </Form.Group>
                    </div>
                  ))}
                  <div className="d-flex justify-content-center">
                    <button
                      style={buttonStyle}
                      onClick={() => {
                        setTechStack((prev) => [...prev, "Select some Tech Stack"]);
                        setForm((prev) => ({
                          ...prev,
                          projects: [
                            ...prev.projects,
                            {
                              id: uuidv4(),
                              title: "",
                              techStack: [],
                              startDate: "",
                              endDate: "",
                              projectLink: "",
                              description: "",
                            },
                          ],
                        }));
                      }}
                    >
                      Add Project
                    </button>
                  </div>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <button
                      style={buttonStyle}
                      onClick={handleSaveAdditional}
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <Spinner animation="border" size="sm" style={{ color: "white" }} />
                      ) : (
                        "Save & Submit"
                      )}
                    </button>
                  </div>
                </div>
              </Tab>
            </Tabs>
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

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

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

          .content-area {
            margin-left: 0 !important;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem !important;
          }

          .content-area {
            padding: 20px !important;
          }

          .form-card {
            padding: 15px !important;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2rem !important;
          }

          .form-card h3 {
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

export default EditProfile;