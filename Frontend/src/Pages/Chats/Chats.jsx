
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";

const socket = io(axios.defaults.baseURL);

const Chats = () => {
  const [activeKey, setActiveKey] = useState("chat");
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);
  const [scheduleModalShow, setScheduleModalShow] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [requestModalShow, setRequestModalShow] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sendMessageLoading, setSendMessageLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "" });
  const [isInputFocused, setIsInputFocused] = useState({});

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (user) socket.emit("setup", user);
    socket.on("message recieved", (newMessageRecieved) => {
      if (selectedChat && selectedChat.id === newMessageRecieved.chatId._id) {
        setChatMessages((prev) => [...prev, newMessageRecieved]);
      }
    });
    return () => socket.off("message recieved");
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      const tempUser = JSON.parse(localStorage.getItem("userInfo"));
      const { data } = await axios.get("http://localhost:8000/chat");
      toast.success(data.message);
      if (tempUser?._id) {
        const temp = data.data.map((chat) => {
          const otherUser = chat?.users.find((u) => u?._id !== tempUser?._id);
          const latestMessage = chat?.latestMessage;
          const isRequestMessage =
            latestMessage?.type === "callRequest" ||
            latestMessage?.content?.includes("Connection Request") ||
            latestMessage?.content?.includes("Connection Accepted") ||
            latestMessage?.content?.includes("Connection Declined");
          return {
            id: chat._id,
            name: otherUser?.name,
            picture: otherUser?.picture,
            username: otherUser?.username,
            latestMessage: latestMessage?.content,
            isRequestMessage,
            hasUnreadRequest: isRequestMessage && latestMessage?.sender?._id !== tempUser?._id,
          };
        }).sort((a, b) => (a.isRequestMessage && !b.isRequestMessage ? -1 : b.isRequestMessage && !a.isRequestMessage ? 1 : 0));
        setChats(temp);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatClick = async (chatId) => {
    try {
      setChatMessageLoading(true);
      const { data } = await axios.get(`http://localhost:8000/message/getMessages/${chatId}`);
      setChatMessages(data.data);
      setMessage("");
      const chatDetails = chats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      socket.emit("join chat", chatId);
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setChatMessageLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message === "") return toast.error("Message is empty");
    if (sendMessageLoading) return;
    try {
      setSendMessageLoading(true);
      const { data } = await axios.post("/message/sendMessage", { chatId: selectedChat.id, content: message });
      socket.emit("new message", data.data);
      setChatMessages((prev) => [...prev, data.data]);
      setMessage("");
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setSendMessageLoading(false);
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get("/request/getRequests");
      setRequests(data.data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setRequestModalShow(true);
  };

  const handleRequestAccept = async () => {
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/acceptRequest", { requestId: selectedRequest._id });
      toast.success(data.message);
      setRequests((prev) => prev.filter((request) => request._id !== selectedRequest._id));
      await fetchChats();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleRequestReject = async () => {
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/rejectRequest", { requestId: selectedRequest._id });
      toast.success(data.message);
      setRequests((prev) => prev.filter((request) => request._id !== selectedRequest._id));
      await fetchChats();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.message === "Please Login") {
        localStorage.removeItem("userInfo");
        setUser(null);
        axios.get("/auth/logout");
        navigate("/login");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  // Event handlers for interactive elements
  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = "#7c3aed";
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = "#8b5cf6";
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  };

  const handleButtonMouseDown = (e) => {
    e.target.style.transform = "translateY(1px)";
    e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
  };

  const handleButtonMouseUp = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
  };

  const handleCardLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  };

  const handleCardMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(1px)";
    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
  };

  const handleCardMouseUp = (e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
  };

  // Styles
  const containerStyle = {
    height: "88vh",
    width: "100vw",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    display: "flex",
    flexDirection: "column",
  };

  const sectionStyle = {
    flex: 1,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    gap: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  };

  const leftSectionStyle = {
    flex: "1",
    minWidth: "300px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
  };

  const rightSectionStyle = {
    flex: "2",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: "20px",
  };

  const inputStyle = (name) => ({
    padding: "10px 15px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: `1px solid ${isInputFocused[name] ? "#8b5cf6" : "#d1d5db"}`,
    backgroundColor: "#f9fafb",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: isInputFocused[name] ? "0 0 0 3px rgba(139, 92, 246, 0.1)" : "none",
  });

  const buttonStyle = {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textTransform: "uppercase",
  };

  return (
    <div style={containerStyle}>

      <div style={sectionStyle}>
        {/* Left Section */}
        <div style={leftSectionStyle}>
          <Tabs
            activeKey={activeKey}
            onSelect={(k) => {
              setActiveKey(k);
              if (k === "chat") fetchChats();
              else if (k === "requests") getRequests();
            }}
            className="custom-tabs"
          >
            <Tab eventKey="chat" title="Chat History">
              <ListGroup style={{ marginTop: "15px" }}>
                {chatLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                    <Spinner animation="border" style={{ color: "#8b5cf6" }} />
                  </div>
                ) : (
                  chats.map((chat) => (
                    <ListGroup.Item
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      style={{
                        cursor: "pointer",
                        marginBottom: "8px",
                        padding: "12px",
                        backgroundColor: selectedChat?.id === chat.id ? "#f3f4f6" : chat.isRequestMessage ? "#fef3c7" : "#ffffff",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={handleCardHover}
                      onMouseLeave={handleCardLeave}
                      onMouseDown={handleCardMouseDown}
                      onMouseUp={handleCardMouseUp}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {chat.picture && (
                            <img
                              src={chat.picture}
                              alt={chat.name}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                marginRight: "10px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                          )}
                          <div>
                            <div style={{
                              fontWeight: "600",
                              color: chat.isRequestMessage ? "#854d0e" : "#1f2937",
                              fontSize: "1rem",
                            }}>
                              {chat.name} {chat.isRequestMessage && <span style={{ color: "#f59e0b" }}>🔔</span>}
                            </div>
                            {chat.latestMessage && (
                              <div style={{
                                fontSize: "0.85rem",
                                color: "#6b7280",
                                marginTop: "2px",
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {chat.latestMessage}
                              </div>
                            )}
                          </div>
                        </div>
                        {chat.hasUnreadRequest && (
                          <div style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: "#ef4444",
                            borderRadius: "50%",
                            border: "1px solid #fff",
                          }} />
                        )}
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Tab>
            <Tab eventKey="requests" title="Requests">
              <ListGroup style={{ marginTop: "15px" }}>
                {requestLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                    <Spinner animation="border" style={{ color: "#8b5cf6" }} />
                  </div>
                ) : (
                  requests.map((request) => (
                    <ListGroup.Item
                      key={request.id}
                      onClick={() => handleRequestClick(request)}
                      style={{
                        cursor: "pointer",
                        marginBottom: "8px",
                        padding: "12px",
                        backgroundColor: selectedRequest?.id === request.id ? "#f3f4f6" : "#ffffff",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={handleCardHover}
                      onMouseLeave={handleCardLeave}
                      onMouseDown={handleCardMouseDown}
                      onMouseUp={handleCardMouseUp}
                    >
                      {request.name}
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Tab>
          </Tabs>
          <Button
            style={{ ...buttonStyle, marginTop: "15px", width: "100%" }}
            onClick={fetchChats}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onMouseDown={handleButtonMouseDown}
            onMouseUp={handleButtonMouseUp}
          >
            Refresh
          </Button>
        </div>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          <div style={{
            padding: "10px 15px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {selectedChat ? (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={selectedChat.picture || "https://via.placeholder.com/150"}
                    alt="Profile"
                    style={{ width: "32px", height: "32px", borderRadius: "50%", marginRight: "10px", border: "1px solid #e5e7eb" }}
                  />
                  <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "1rem" }}>
                    {selectedChat.username}
                  </span>
                </div>
                <Button
                  style={buttonStyle}
                  onClick={() => setScheduleModalShow(true)}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Request Video Call
                </Button>
              </>
            ) : (
              <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "1rem" }}>
                Select a chat to start messaging
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {selectedChat ? (
              <ScrollableFeed forceScroll={true} style={{ flex: 1, overflowY: "auto", padding: "15px" }}>
                {chatMessages.map((message, index) => {
                  const isRequestMessage =
                    message.type === "callRequest" ||
                    message.content?.includes("Connection Request") ||
                    message.content?.includes("Connection Accepted") ||
                    message.content?.includes("Connection Declined");
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: isRequestMessage ? "center" : (message.sender._id === user._id ? "flex-end" : "flex-start"),
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isRequestMessage
                            ? message.content?.includes("Connection Accepted")
                              ? "#d1fae5"
                              : message.content?.includes("Connection Declined")
                              ? "#fee2e2"
                              : "#fef3c7"
                            : message.sender._id === user._id
                            ? "#e5e7eb"
                            : "#8b5cf6",
                          color: isRequestMessage
                            ? message.content?.includes("Connection Accepted")
                              ? "#065f46"
                              : message.content?.includes("Connection Declined")
                              ? "#991b1b"
                              : "#854d0e"
                            : message.sender._id === user._id
                            ? "#1f2937"
                            : "#ffffff",
                          padding: isRequestMessage ? "12px 18px" : "8px 12px",
                          borderRadius: "6px",
                          maxWidth: isRequestMessage ? "80%" : "70%",
                          textAlign: isRequestMessage ? "center" : (message.sender._id === user._id ? "right" : "left"),
                          fontWeight: isRequestMessage ? "600" : "normal",
                          fontSize: "0.9rem",
                          border: isRequestMessage ? "1px solid #e5e7eb" : "none",
                          boxShadow: isRequestMessage ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}
              </ScrollableFeed>
            ) : (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {chatMessageLoading ? (
                  <Spinner animation="border" style={{ color: "#8b5cf6" }} />
                ) : (
                  <h3 style={{ color: "#6b7280", fontWeight: "600" }}>
                    Select a chat to start messaging
                  </h3>
                )}
              </div>
            )}
          </div>

          {selectedChat && (
            <div style={{
              padding: "10px 15px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
            }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={inputStyle("message")}
                onFocus={() => setIsInputFocused((prev) => ({ ...prev, message: true }))}
                onBlur={() => setIsInputFocused((prev) => ({ ...prev, message: false }))}
              />
              <Button
                style={{ ...buttonStyle, marginLeft: "10px" }}
                onClick={sendMessage}
                disabled={sendMessageLoading}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                onMouseDown={handleButtonMouseDown}
                onMouseUp={handleButtonMouseUp}
              >
                {sendMessageLoading ? <Spinner animation="border" size="sm" /> : "Send"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Video Call Modal */}
      {scheduleModalShow && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              padding: "20px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              Request a Meeting
            </h3>
            <Form>
              <Form.Group controlId="formDate" style={{ marginBottom: "15px" }}>
                <Form.Label style={{ color: "#4b5563", fontWeight: "500" }}>Preferred Date</Form.Label>
                <Form.Control
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  style={inputStyle("date")}
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, date: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, date: false }))}
                />
              </Form.Group>
              <Form.Group controlId="formTime" style={{ marginBottom: "15px" }}>
                <Form.Label style={{ color: "#4b5563", fontWeight: "500" }}>Preferred Time</Form.Label>
                <Form.Control
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  style={inputStyle("time")}
                  onFocus={() => setIsInputFocused((prev) => ({ ...prev, time: true }))}
                  onBlur={() => setIsInputFocused((prev) => ({ ...prev, time: false }))}
                />
              </Form.Group>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <Button
                  style={buttonStyle}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (scheduleForm.date === "" || scheduleForm.time === "") {
                      toast.error("Please fill all the fields");
                      return;
                    }
                    scheduleForm.username = selectedChat.username;
                    try {
                      if (scheduleSubmitting) return;
                      setScheduleSubmitting(true);
                      const { data } = await axios.post("/user/sendScheduleMeet", scheduleForm);
                      if (data?.data) setChatMessages((prev) => [...prev, data.data]);
                      toast.success("Request sent and posted to chat");
                      setScheduleForm({ date: "", time: "" });
                    } catch (error) {
                      toast.error(error?.response?.data?.message || "Something went wrong");
                      if (error?.response?.data?.message === "Please Login") {
                        localStorage.removeItem("userInfo");
                        setUser(null);
                        await axios.get("/auth/logout");
                        navigate("/login");
                      }
                    } finally {
                      setScheduleSubmitting(false);
                      setScheduleModalShow(false);
                    }
                  }}
                  disabled={scheduleSubmitting}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  {scheduleSubmitting ? <Spinner animation="border" size="sm" /> : "Submit"}
                </Button>
                <Button
                  style={{ ...buttonStyle, backgroundColor: "#ef4444" }}
                  onClick={() => setScheduleModalShow(false)}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ef4444";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseDown={handleButtonMouseDown}
                  onMouseUp={handleButtonMouseUp}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestModalShow && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              padding: "20px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              Confirm Your Choice
            </h3>
            {selectedRequest && (
              <RequestCard
                name={selectedRequest?.name}
                skills={selectedRequest?.skillsProficientAt}
                rating="4"
                picture={selectedRequest?.picture}
                username={selectedRequest?.username}
                onClose={() => setRequestModalShow(false)}
              />
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
              <Button
                style={buttonStyle}
                onClick={handleRequestAccept}
                disabled={acceptRequestLoading}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                onMouseDown={handleButtonMouseDown}
                onMouseUp={handleButtonMouseUp}
              >
                {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : "Accept"}
              </Button>
              <Button
                style={{ ...buttonStyle, backgroundColor: "#ef4444" }}
                onClick={handleRequestReject}
                disabled={acceptRequestLoading}
                onMouseEnter={handleButtonHover}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#ef4444";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
                onMouseDown={handleButtonMouseDown}
                onMouseUp={handleButtonMouseUp}
              >
                {acceptRequestLoading ? <Spinner animation="border" size="sm" /> : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
