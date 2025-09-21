import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState({}); // Track focus state for inputs
  const [activeSkill, setActiveSkill] = useState(null); // For skill button animations

  const [form, setForm] = useState({
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
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await axios.get("/user/unregistered/getDetails");
        console.log(data);
        const edu = data?.data?.education || [];
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        const proj = data?.data?.projects || [];
        proj.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (proj.length > 0) {
          setTechStack(proj.map(() => "Select some Tech Stack"));
        }
        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name || "",
          email: data?.data?.email || "",
          username: data?.data?.username || "",
          skillsProficientAt: data?.data?.skillsProficientAt || [],
          skillsToLearn: data?.data?.skillsToLearn || [],
          linkedinLink: data?.data?.linkedinLink || "",
          githubLink: data?.data?.githubLink || "",
          portfolioLink: data?.data?.portfolioLink || "",
          education: edu,
          bio: data?.data?.bio || "",
          projects: proj,
        }));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          navigate("/login");
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
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
        toast.error("Skill already added in skills proficient at");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: [...prevState.skillsToLearn, skillsToLearn],
      }));
      setActiveSkill(skillsToLearn);
      setTimeout(() => setActiveSkill(null), 2000);
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
        toast.error("Skill already added in skills to learn");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: [...prevState.skillsProficientAt, skillsProficientAt],
      }));
      setActiveSkill(skillsProficientAt);
      setTimeout(() => setActiveSkill(null), 2000);
    }
  };

  const handleRemoveSkill = (e, temp) => {
    const skill = e.target.innerText.split(" ")[0];
    if (temp === "skills_proficient_at") {
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: prevState.skillsProficientAt.filter((item) => item !== skill),
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: prevState.skillsToLearn.filter((item) => item !== skill),
      }));
    }
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item) => item.id !== tid);
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter at least one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter at least one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter at least one link among portfolio, github, and linkedin");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && !githubRegex.test(form.githubLink)) {
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && !linkedinRegex.test(form.linkedinLink)) {
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && !form.portfolioLink.includes("http")) {
      toast.error("Enter a valid portfolio link");
      return false;
    }
    return true;
  };

  const validateEduForm = () => {
    for (const [index, edu] of form.education.entries()) {
      if (!edu.institution) {
        toast.error(`Institution name is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.degree) {
        toast.error(`Degree is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.startDate) {
        toast.error(`Start date is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.endDate) {
        toast.error(`End date is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.score) {
        toast.error(`Score is empty in education field ${index + 1}`);
        return false;
      }
    }
    return true;
  };

  const validateAddForm = () => {
    let flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title) {
        toast.error(`Title is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech Stack is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.startDate) {
        toast.error(`Start Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.endDate) {
        toast.error(`End Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink) {
        toast.error(`Project Link is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.description) {
        toast.error(`Description is empty in project ${index + 1}`);
        flag = false;
      }
      if (project.startDate && project.endDate && project.startDate > project.endDate) {
        toast.error(`Start Date should be less than End Date in project ${index + 1}`);
        flag = false;
      }
      if (project.projectLink && !project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        toast.error(`Please provide valid project link in project ${index + 1}`);
        flag = false;
      }
    });
    return flag;
  };

  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        await axios.post("/user/unregistered/saveRegDetails", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        await axios.post("/user/unregistered/saveEduDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        await axios.post("/user/unregistered/saveAddDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/registerUser", form);
        toast.success("Registration Successful");
        navigate("/discover");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  // Event handlers for interactive elements
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
  };

  const mainTitleStyle = {
    fontSize: "4rem",
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: "40px",
    letterSpacing: "-2px",
    lineHeight: "1.1",
    textShadow: "3px 3px 0px rgba(139, 92, 246, 0.1)",
    textAlign: "center",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const sectionStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "20px",
    border: "4px solid #000",
    boxShadow: "8px 8px 0px #000",
    padding: "40px",
    transition: "all 0.2s ease",
    position: "relative",
  };

  const inputStyle = (name) => ({
    padding: "14px 20px",
    fontSize: "1rem",
    borderRadius: "12px",
    border: `3px solid ${isInputFocused[name] ? "#8b5cf6" : "#000"}`,
    boxShadow: "6px 6px 0px #000",
    backgroundColor: "white",
    width: "100%",
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: "500",
    marginBottom: "20px",
  });

  const selectStyle = {
    padding: "12px 20px",
    fontSize: "1rem",
    borderRadius: "12px",
    border: "3px solid #000",
    boxShadow: "6px 6px 0px #000",
    backgroundColor: "white",
    width: "100%",
    transition: "all 0.2s ease",
    fontWeight: "500",
    marginBottom: "20px",
  };

  const buttonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "3px solid #000",
    padding: "12px 30px",
    fontSize: "1rem",
    fontWeight: "700",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "6px 6px 0px #000",
    transform: "translate(0, 0)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "10px 5px",
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#eab308",
  };

  const badgeStyle = (skill) => ({
    backgroundColor: activeSkill === skill ? "#8b5cf6" : "#e5e7eb",
    color: activeSkill === skill ? "white" : "#2d2d2d",
    border: "2px solid #000",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    boxShadow: "3px 3px 0px #000",
    transition: "all 0.2s ease",
    margin: "5px",
  });

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "3px solid #000",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "8px 8px 0px #000",
    transition: "all 0.2s ease",
    marginBottom: "20px",
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

      <h1 style={mainTitleStyle}>Registration Form</h1>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <Spinner animation="border" style={{ color: "#8b5cf6" }} />
        </div>
      ) : (
        <div
          style={sectionStyle}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
          onMouseDown={handleCardMouseDown}
          onMouseUp={handleCardMouseUp}
        >
          <Tabs
            defaultActiveKey="registration"
            id="justify-tab-example"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="custom-tabs"
          >
            <Tab eventKey="registration" title="Registration">
              {/* Name */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleInputChange}
                  style={inputStyle("name")}
                  value={form.name}
                  disabled
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, name: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, name: false }))}
                />
              </div>
              {/* Email */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Email</label>
                <input
                  type="text"
                  name="email"
                  onChange={handleInputChange}
                  style={inputStyle("email")}
                  value={form.email}
                  disabled
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, email: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, email: false }))}
                />
              </div>
              {/* Username */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Username</label>
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={form.username}
                  style={inputStyle("username")}
                  placeholder="Enter your username"
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, username: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, username: false }))}
                />
              </div>
              {/* Linkedin Profile Link */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Linkedin Link</label>
                <input
                  type="text"
                  name="linkedinLink"
                  value={form.linkedinLink}
                  onChange={handleInputChange}
                  style={inputStyle("linkedinLink")}
                  placeholder="Enter your Linkedin link"
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, linkedinLink: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, linkedinLink: false }))}
                />
              </div>
              {/* Github Profile Link */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Github Link</label>
                <input
                  type="text"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleInputChange}
                  style={inputStyle("githubLink")}
                  placeholder="Enter your Github link"
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, githubLink: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, githubLink: false }))}
                />
              </div>
              {/* Portfolio Link */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Portfolio Link</label>
                <input
                  type="text"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  style={inputStyle("portfolioLink")}
                  placeholder="Enter your portfolio link"
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, portfolioLink: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, portfolioLink: false }))}
                />
              </div>
              {/* Skills Proficient At */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                  Skills Proficient At
                </label>
                <Form.Select
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                  style={selectStyle}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsProficientAt.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {form.skillsProficientAt.map((skill, index) => (
                      <Badge
                        key={index}
                        style={badgeStyle(skill)}
                        onClick={(event) => handleRemoveSkill(event, "skills_proficient_at")}
                      >
                        {skill} ✕
                      </Badge>
                    ))}
                  </div>
                )}
                <button
                  style={buttonStyle}
                  name="skill_proficient_at"
                  onClick={handleAddSkill}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Add Skill
                </button>
              </div>
              {/* Skills to Learn */}
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px", marginTop: "20px" }}>
                  Skills To Learn
                </label>
                <Form.Select
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                  style={selectStyle}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsToLearn.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {form.skillsToLearn.map((skill, index) => (
                      <Badge
                        key={index}
                        style={badgeStyle(skill)}
                        onClick={(event) => handleRemoveSkill(event, "skills_to_learn")}
                      >
                        {skill} ✕
                      </Badge>
                    ))}
                  </div>
                )}
                <button
                  style={buttonStyle}
                  name="skill_to_learn"
                  onClick={handleAddSkill}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Add Skill
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px" }}>
                <button
                  style={saveButtonStyle}
                  onClick={handleSaveRegistration}
                  disabled={saveLoading}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  {saveLoading ? <Spinner animation="border" style={{ color: "#fff" }} /> : "Save"}
                </button>
                <button
                  style={buttonStyle}
                  onClick={handleNext}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div
                  key={edu.id}
                  style={cardStyle}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                  onMouseDown={handleCardMouseDown}
                  onMouseUp={handleCardMouseUp}
                >
                  {index !== 0 && (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#ef4444" }}
                        onClick={(e) => handleRemoveEducation(e, edu.id)}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "6px 6px 0px #000";
                          e.target.style.backgroundColor = "#ef4444";
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={inputStyle(`institution_${index}`)}
                    placeholder="Enter your institution name"
                    onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`institution_${index}`]: true }))}
                    onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`institution_${index}`]: false }))}
                  />
                  <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={inputStyle(`degree_${index}`)}
                    placeholder="Enter your degree"
                    onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`degree_${index}`]: true }))}
                    onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`degree_${index}`]: false }))}
                  />
                  <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                    Grade/Percentage
                  </label>
                  <input
                    type="number"
                    name="score"
                    value={edu.score}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={inputStyle(`score_${index}`)}
                    placeholder="Enter your grade/percentage"
                    onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`score_${index}`]: true }))}
                    onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`score_${index}`]: false }))}
                  />
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle(`startDate_${index}`)}
                        onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`startDate_${index}`]: true }))}
                        onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`startDate_${index}`]: false }))}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={inputStyle(`endDate_${index}`)}
                        onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`endDate_${index}`]: true }))}
                        onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`endDate_${index}`]: false }))}
                      />
                    </div>
                  </div>
                  <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={edu.description}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={inputStyle(`description_${index}`)}
                    placeholder="Enter your experience or achievements"
                    onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`description_${index}`]: true }))}
                    onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`description_${index}`]: false }))}
                  />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <button
                  style={buttonStyle}
                  onClick={() => {
                    setForm((prevState) => ({
                      ...prevState,
                      education: [
                        ...prevState.education,
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
                    }));
                  }}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Add Education
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <button
                  style={saveButtonStyle}
                  onClick={handleSaveEducation}
                  disabled={saveLoading}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  {saveLoading ? <Spinner animation="border" style={{ color: "#fff" }} /> : "Save"}
                </button>
                <button
                  style={buttonStyle}
                  onClick={handleNext}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="longer-tab" title="Additional">
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                  Bio (Max 500 Characters)
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  style={{ ...inputStyle("bio"), minHeight: "100px", resize: "vertical" }}
                  placeholder="Enter your bio"
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, bio: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, bio: false }))}
                />
              </div>
              <div>
                <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Projects</label>
                {form.projects.map((project, index) => (
                  <div
                    key={project.id}
                    style={cardStyle}
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                    onMouseDown={handleCardMouseDown}
                    onMouseUp={handleCardMouseUp}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#ef4444" }}
                        onClick={() => {
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.filter((item) => item.id !== project.id),
                          }));
                        }}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "6px 6px 0px #000";
                          e.target.style.backgroundColor = "#ef4444";
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        Remove
                      </button>
                    </div>
                    <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={inputStyle(`title_${index}`)}
                      placeholder="Enter your project title"
                      onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`title_${index}`]: true }))}
                      onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`title_${index}`]: false }))}
                    />
                    <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Tech Stack</label>
                    <Form.Select
                      value={techStack[index]}
                      onChange={(e) =>
                        setTechStack((prevState) =>
                          prevState.map((item, i) => (i === index ? e.target.value : item))
                        )
                      }
                      style={selectStyle}
                    >
                      <option>Select some Tech Stack</option>
                      {skills.map((skill, i) => (
                        <option key={i} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                    {form.projects[index].techStack.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {form.projects[index].techStack.map((skill, i) => (
                          <Badge
                            key={i}
                            style={badgeStyle(skill)}
                            onClick={() => {
                              setForm((prevState) => ({
                                ...prevState,
                                projects: prevState.projects.map((item, idx) =>
                                  idx === index
                                    ? { ...item, techStack: item.techStack.filter((s) => s !== skill) }
                                    : item
                                ),
                              }));
                            }}
                          >
                            {skill} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                    <button
                      style={buttonStyle}
                      name="tech_stack"
                      onClick={() => {
                        if (techStack[index] === "Select some Tech Stack") {
                          toast.error("Select a tech stack to add");
                          return;
                        }
                        if (form.projects[index].techStack.includes(techStack[index])) {
                          toast.error("Tech Stack already added");
                          return;
                        }
                        setForm((prevState) => ({
                          ...prevState,
                          projects: prevState.projects.map((item, i) =>
                            i === index ? { ...item, techStack: [...item.techStack, techStack[index]] } : item
                          ),
                        }));
                        setActiveSkill(techStack[index]);
                        setTimeout(() => setActiveSkill(null), 2000);
                      }}
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                      onMouseDown={handleButtonMouseDown}
                      onMouseUp={handleButtonMouseUp}
                    >
                      Add Tech Stack
                    </button>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={inputStyle(`projectStartDate_${index}`)}
                          onFocus={() =>
                            setIsInputFocused((prev) => ({ ...prev, [`projectStartDate_${index}`]: true }))
                          }
                          onBlur={() =>
                            setIsInputFocused((prev) => ({ ...prev, [`projectStartDate_${index}`]: false }))
                          }
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={inputStyle(`projectEndDate_${index}`)}
                          onFocus={() =>
                            setIsInputFocused((prev) => ({ ...prev, [`projectEndDate_${index}`]: true }))
                          }
                          onBlur={() =>
                            setIsInputFocused((prev) => ({ ...prev, [`projectEndDate_${index}`]: false }))
                          }
                        />
                      </div>
                    </div>
                    <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Project Link</label>
                    <input
                      type="text"
                      name="projectLink"
                      value={project.projectLink}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={inputStyle(`projectLink_${index}`)}
                      placeholder="Enter your project link"
                      onFocus={() => setIsInputFocused((prev) => ({ ...prev, [`projectLink_${index}`]: true }))}
                      onBlur={() => setIsInputFocused((prev) => ({ ...prev, [`projectLink_${index}`]: false }))}
                    />
                    <label style={{ color: "#8b5cf6", fontWeight: "600", marginBottom: "10px" }}>Description</label>
                    <input
                      type="text"
                      name="description"
                      value={project.description}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={inputStyle(`projectDescription_${index}`)}
                      placeholder="Enter your project description"
                      onFocus={() =>
                        setIsInputFocused((prev) => ({ ...prev, [`projectDescription_${index}`]: true }))
                      }
                      onBlur={() =>
                        setIsInputFocused((prev) => ({ ...prev, [`projectDescription_${index}`]: false }))
                      }
                    />
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                  <button
                    style={buttonStyle}
                    onClick={() => {
                      setTechStack((prevState) => [...prevState, "Select some Tech Stack"]);
                      setForm((prevState) => ({
                        ...prevState,
                        projects: [
                          ...prevState.projects,
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
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                    onMouseDown={handleButtonMouseDown}
                    onMouseUp={handleButtonMouseUp}
                  >
                    Add Project
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <button
                  style={saveButtonStyle}
                  onClick={handleSaveAdditional}
                  disabled={saveLoading}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  {saveLoading ? <Spinner animation="border" style={{ color: "#fff" }} /> : "Save"}
                </button>
                <button
                  style={buttonStyle}
                  onClick={handleNext}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="Preview" title="Confirm Details">
              <div>
                <h3
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    textAlign: "center",
                    marginBottom: "40px",
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Preview of the Form
                </h3>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: "#2d2d2d",
                    maxWidth: "700px",
                    margin: "0 auto",
                  }}
                >
                  {[
                    { label: "Name", value: form.name },
                    { label: "Email ID", value: form.email },
                    { label: "Username", value: form.username },
                    { label: "Portfolio Link", value: form.portfolioLink },
                    { label: "Github Link", value: form.githubLink },
                    { label: "Linkedin Link", value: form.linkedinLink },
                    { label: "Skills Proficient At", value: form.skillsProficientAt.join(", ") },
                    { label: "Skills To Learn", value: form.skillsToLearn.join(", ") },
                    { label: "Bio", value: form.bio },
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ flex: 1, fontWeight: "700", color: "#8b5cf6" }}>{item.label}:</span>
                      <span style={{ flex: 2, color: "#4a4a4a" }}>{item.value || "Yet to be filled"}</span>
                    </div>
                  ))}
                  {form.education.map((edu, index) => (
                    <div
                      key={edu.id}
                      style={{
                        ...cardStyle,
                        marginTop: "20px",
                      }}
                      onMouseEnter={handleCardHover}
                      onMouseLeave={handleCardLeave}
                      onMouseDown={handleCardMouseDown}
                      onMouseUp={handleCardMouseUp}
                    >
                      <h4 style={{ color: "#8b5cf6", fontWeight: "700", marginBottom: "15px" }}>
                        Education {index + 1}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Institution:</span>{" "}
                          {edu.institution || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Degree:</span>{" "}
                          {edu.degree || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Score:</span>{" "}
                          {edu.score || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Start Date:</span>{" "}
                          {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>End Date:</span>{" "}
                          {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Description:</span>{" "}
                          {edu.description || "Yet to be filled"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {form.projects.map((project, index) => (
                    <div
                      key={project.id}
                      style={{
                        ...cardStyle,
                        marginTop: "20px",
                      }}
                      onMouseEnter={handleCardHover}
                      onMouseLeave={handleCardLeave}
                      onMouseDown={handleCardMouseDown}
                      onMouseUp={handleCardMouseUp}
                    >
                      <h4 style={{ color: "#8b5cf6", fontWeight: "700", marginBottom: "15px" }}>
                        Project {index + 1}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Title:</span>{" "}
                          {project.title || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Tech Stack:</span>{" "}
                          {project.techStack.join(", ") || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Start Date:</span>{" "}
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>End Date:</span>{" "}
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Project Link:</span>{" "}
                          {project.projectLink || "Yet to be filled"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "#8b5cf6" }}>Description:</span>{" "}
                          {project.description || "Yet to be filled"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                  <button
                    style={buttonStyle}
                    onClick={handleSubmit}
                    disabled={saveLoading}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                    onMouseDown={handleButtonMouseDown}
                    onMouseUp={handleButtonMouseUp}
                  >
                    {saveLoading ? <Spinner animation="border" style={{ color: "#fff" }} /> : "Submit"}
                  </button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
      <style jsx>{`
        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
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

        .custom-tabs .nav-link {
          background-color: #ffffff;
          color: #2d2d2d;
          border: 3px solid #000;
          border-radius: 12px;
          margin: 5px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 4px 4px 0px #000;
        }

        .custom-tabs .nav-link:hover {
          background-color: #f8fafc;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000;
        }

        .custom-tabs .nav-link.active {
          background-color: #8b5cf6;
          color: white;
          border-color: #000;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000;
        }

        @media (max-width: 768px) {
          input,
          textarea,
          select {
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;