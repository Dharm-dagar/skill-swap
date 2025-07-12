
import React, { useState, useEffect } from 'react';
import { User, Search, Home, MessageCircle, Star, MapPin, Clock, Eye, EyeOff, Edit, X, Check, ArrowLeft, ArrowRight, ChevronDown, Bell, Menu, Plus, Filter } from 'lucide-react';

const SkillSwapPlatform = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [requestForm, setRequestForm] = useState({
    offeredSkill: '',
    wantedSkill: '',
    message: ''
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'weekends',
    profileVisibility: 'public',
    bio: ''
  });
  const [showSignup, setShowSignup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(`http://localhost:5000/api/users?page=${currentPage}&limit=4${searchTerm ? `&search=${searchTerm}` : ''}${availabilityFilter !== 'all' ? `&availability=${availabilityFilter}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const usersData = await usersResponse.json();
        if (usersResponse.ok) {
          setUsers(usersData.users);
        } else {
          setError(usersData.error || 'Failed to fetch users');
        }

        // Fetch requests
        const requestsResponse = await fetch('http://localhost:5000/api/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const requestsData = await requestsResponse.json();
        if (requestsResponse.ok) {
          setRequests(requestsData.requests);
        } else {
          setError(requestsData.error || 'Failed to fetch requests');
        }

        // Fetch notifications
        const notificationsResponse = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const notificationsData = await notificationsResponse.json();
        if (notificationsResponse.ok) {
          setNotifications(notificationsData.notifications);
        } else {
          setError(notificationsData.error || 'Failed to fetch notifications');
        }

        // Check for logged-in user
        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await fetch('http://localhost:5000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (userResponse.ok) {
            setCurrentUser(userData);
            setProfileForm({
              name: userData.name,
              location: userData.location,
              skillsOffered: userData.skillsOffered || [],
              skillsWanted: userData.skillsWanted || [],
              availability: userData.availability || 'weekends',
              profileVisibility: userData.profileVisibility || 'public',
              bio: userData.bio || ''
            });
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        setError('Failed to fetch initial data');
      }
    };
    fetchData();
  }, [currentPage, searchTerm, availabilityFilter]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setProfileForm({
          name: data.user.name,
          location: data.user.location,
          skillsOffered: data.user.skillsOffered || [],
          skillsWanted: data.user.skillsWanted || [],
          availability: data.user.availability || 'weekends',
          profileVisibility: data.user.profileVisibility || 'public',
          bio: data.user.bio || ''
        });
        setCurrentScreen('home');
        setError(null);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          location: signupForm.location
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setProfileForm({
          name: data.user.name,
          location: data.user.location,
          skillsOffered: data.user.skillsOffered || [],
          skillsWanted: data.user.skillsWanted || [],
          availability: data.user.availability || 'weekends',
          profileVisibility: data.user.profileVisibility || 'public',
          bio: data.user.bio || ''
        });
        setCurrentScreen('profile');
        setError(null);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
    }
  };

  const handleRequest = (user) => {
    if (!currentUser) {
      setError('Please login first to make a request');
      return;
    }
    setSelectedUser(user);
    setShowRequestModal(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toUserId: selectedUser.id,
          offeredSkill: requestForm.offeredSkill,
          wantedSkill: requestForm.wantedSkill,
          message: requestForm.message
        })
      });
      const data = await response.json();
      if (response.ok) {
        setRequests([...requests, {
          id: data.requestId,
          fromUser: {
            id: currentUser.id,
            name: currentUser.name,
            profilePhoto: currentUser.profilePhoto,
            rating: currentUser.rating
          },
          toUser: {
            id: selectedUser.id,
            name: selectedUser.name,
            profilePhoto: selectedUser.profilePhoto,
            rating: selectedUser.rating
          },
          offeredSkill: requestForm.offeredSkill,
          wantedSkill: requestForm.wantedSkill,
          message: requestForm.message,
          status: 'pending',
          createdAt: new Date().toISOString()
        }]);
        setNotifications([
          {
            id: notifications.length + 1,
            type: 'request_sent',
            message: `Request sent to ${selectedUser.name}`,
            read: false,
            createdAt: new Date().toISOString()
          },
          ...notifications
        ]);
        setShowRequestModal(false);
        setRequestForm({ offeredSkill: '', wantedSkill: '', message: '' });
        setError(null);
        alert('Request sent successfully!');
      } else {
        setError(data.error || 'Failed to send request');
      }
    } catch (err) {
      setError('An error occurred while sending the request');
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status, updatedAt: data.request.updatedAt } : req
        ));
        const request = requests.find(r => r.id === requestId);
        if (request) {
          setNotifications([
            {
              id: notifications.length + 1,
              type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
              message: `You ${status} ${request.fromUser.name}'s request`,
              read: false,
              createdAt: new Date().toISOString()
            },
            ...notifications
          ]);
        }
        setError(null);
      } else {
        setError(data.error || 'Failed to update request status');
      }
    } catch (err) {
      setError('An error occurred while updating the request');
    }
  };

  const addSkill = (type, skill) => {
    if (skill.trim() && !profileForm[type].includes(skill.trim())) {
      setProfileForm({
        ...profileForm,
        [type]: [...profileForm[type], skill.trim()]
      });
    }
  };

  const removeSkill = (type, skillIndex) => {
    setProfileForm({
      ...profileForm,
      [type]: profileForm[type].filter((_, index) => index !== skillIndex)
    });
  };

  const saveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setError(null);
        alert('Profile saved successfully!');
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred while saving the profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentScreen('home');
    setError(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = availabilityFilter === 'all' || user.availability === availabilityFilter;
    return matchesSearch && matchesAvailability && user.profileVisibility === 'public' && user.id !== currentUser?.id;
  });

  const usersPerPage = 4;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Navigation Component
  const Navigation = ({ showMobile = false }) => (
    <nav className={`bg-gray-900 border-b border-gray-700 px-4 md:px-6 py-4 ${showMobile ? 'md:hidden' : 'hidden md:block'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-white">SkillSwap</h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          {currentUser ? (
            <>
              <button
                onClick={() => setCurrentScreen('home')}
                className={`p-2 rounded-lg ${currentScreen === 'home' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Home className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setCurrentScreen('requests')}
                className={`p-2 rounded-lg relative ${currentScreen === 'requests' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <MessageCircle className="w-5 h-5 text-white" />
                {requests.filter(r => r.status === 'pending' && r.toUser.id === currentUser.id).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 relative"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <span className="text-lg">{currentUser.profilePhoto}</span>
                <span className="text-white hidden md:block">{currentUser.name}</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentScreen('login')}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // Mobile Navigation
  const MobileNavigation = () => (
    <div className="md:hidden">
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">SkillSwap</h1>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {showMobileMenu && (
        <div className="bg-gray-800 px-4 py-2 space-y-2">
          {currentUser ? (
            <>
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('requests');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded"
              >
                Requests
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('profile');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setCurrentScreen('login');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded"
            >
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Home Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-gray-100">
      <MobileNavigation />
      <Navigation />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Perfect Skill Match</h2>
          <p className="text-blue-100">Connect with learners and teachers worldwide. Exchange skills, grow together.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search skills, users, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
              >
                <option value="all">All Availability</option>
                <option value="weekends">Weekends</option>
                <option value="weekdays">Weekdays</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentUsers.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    {user.profilePhoto.startsWith('/uploads') ? (
                      <img src={`http://localhost:5000${user.profilePhoto}`} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.profilePhoto
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {user.availability}
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(user.rating)}
                        <span className="ml-1">{user.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{user.bio}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Offers:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsOffered.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Wants:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsWanted.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{user.totalSwaps}</span> swaps • 
                    <span className="ml-1">responds in {user.responseTime}</span>
                  </div>
                  <button
                    onClick={() => handleRequest(user)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Send Skill Swap Request</h3>
            <form onSubmit={submitRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your offered skill</label>
                <select
                  value={requestForm.offeredSkill}
                  onChange={(e) => setRequestForm({...requestForm, offeredSkill: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a skill you offer</option>
                  {currentUser?.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Skill you want to learn</label>
                <select
                  value={requestForm.wantedSkill}
                  onChange={(e) => setRequestForm({...requestForm, wantedSkill: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a skill they offer</option>
                  {selectedUser?.skillsOffered.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Introduce yourself and explain why you'd like to exchange skills..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Requests Screen
  const RequestsScreen = () => (
    <div className="min-h-screen bg-gray-100">
      <MobileNavigation />
      <Navigation />

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skill Swap Requests</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
                Received ({requests.filter(r => r.toUser.id === currentUser?.id).length})
              </button>
              <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
                Sent ({requests.filter(r => r.fromUser.id === currentUser?.id).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests
            .filter(req => req.toUser.id === currentUser?.id)
            .map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {request.fromUser.profilePhoto.startsWith('/uploads') ? (
                      <img src={`http://localhost:5000${request.fromUser.profilePhoto}`} alt={request.fromUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      request.fromUser.profilePhoto
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{request.fromUser.name}</h3>
                      <span className="text-sm text-gray-500">{formatTimeAgo(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {renderStars(request.fromUser.rating)}
                      <span className="text-sm text-gray-600">{request.fromUser.rating}/5</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Skill Exchange:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {request.offeredSkill}
                      </span>
                      <span className="mx-2 text-gray-400">↔</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {request.wantedSkill}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{request.message}</p>
                    {request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRequestStatus(request.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestStatus(request.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    )}
                    {request.status === 'accepted' && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Accepted</span>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <X className="w-4 h-4" />
                        <span className="font-medium">Declined</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {requests.filter(r => r.toUser.id === currentUser?.id).length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">When someone wants to exchange skills with you, their requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Profile Screen
  const ProfileScreen = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [skillType, setSkillType] = useState('skillsOffered');
    const [photoFile, setPhotoFile] = useState(null);

    const handlePhotoUpload = async (e) => {
      e.preventDefault();
      if (!photoFile) {
        setError('Please select a photo to upload');
        return;
      }
      const formData = new FormData();
      formData.append('photo', photoFile);
      try {
        const response = await fetch('http://localhost:5000/api/users/profile/photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser({ ...currentUser, profilePhoto: data.profilePhoto });
          setError(null);
          alert('Profile photo updated successfully!');
        } else {
          setError(data.error || 'Failed to upload photo');
        }
      } catch (err) {
        setError('An error occurred while uploading the photo');
      }
    };

    return (
      <div className="min-h-screen bg-gray-100">
        <MobileNavigation />
        <Navigation />

        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handlePhotoUpload}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Upload Photo
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm({...profileForm, availability: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekends">Weekends</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="evenings">Evenings</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={profileForm.profileVisibility === 'public'}
                        onChange={(e) => setProfileForm({...profileForm, profileVisibility: e.target.value})}
                        className="mr-2"
                      />
                      <Eye className="w-4 h-4 mr-1" />
                      Public
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={profileForm.profileVisibility === 'private'}
                        onChange={(e) => setProfileForm({...profileForm, profileVisibility: e.target.value})}
                        className="mr-2"
                      />
                      <EyeOff className="w-4 h-4 mr-1" />
                      Private
                    </label>
                  </div>
                </div>

                {/* Skills Management */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills I Offer</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileForm.skillsOffered.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                          {skill}
                          <button
                            onClick={() => removeSkill('skillsOffered', index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillType === 'skillsOffered' ? newSkill : ''}
                        onChange={(e) => {
                          if (skillType === 'skillsOffered') setNewSkill(e.target.value);
                        }}
                        onFocus={() => setSkillType('skillsOffered')}
                        placeholder="Add a skill you can teach"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          addSkill('skillsOffered', newSkill);
                          setNewSkill('');
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Skills I Want to Learn</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileForm.skillsWanted.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                          {skill}
                          <button
                            onClick={() => removeSkill('skillsWanted', index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillType === 'skillsWanted' ? newSkill : ''}
                        onChange={(e) => {
                          if (skillType === 'skillsWanted') setNewSkill(e.target.value);
                        }}
                        onFocus={() => setSkillType('skillsWanted')}
                        placeholder="Add a skill you want to learn"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          addSkill('skillsWanted', newSkill);
                          setNewSkill('');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      saveProfile();
                      setIsEditing(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                    {currentUser?.profilePhoto.startsWith('/uploads') ? (
                      <img src={`http://localhost:5000${currentUser.profilePhoto}`} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentUser?.profilePhoto
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {currentUser?.location}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(currentUser?.rating || 0)}
                        <span className="text-sm text-gray-600">{currentUser?.rating}/5</span>
                      </div>
                      <span className="text-sm text-gray-600">{currentUser?.totalSwaps} swaps</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{currentUser?.bio || 'No bio available'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Skills I Offer</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser?.skillsOffered.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Skills I Want to Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser?.skillsWanted.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Availability</h4>
                    <p className="text-gray-700 capitalize">{currentUser?.availability}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Profile Visibility</h4>
                    <div className="flex items-center text-gray-700">
                      {currentUser?.profileVisibility === 'public' ? (
                        <><Eye className="w-4 h-4 mr-1" /> Public</>
                      ) : (
                        <><EyeOff className="w-4 h-4 mr-1" /> Private</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to SkillSwap</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!showSignup ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mb-4"
            >
              Login
            </button>
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={signupForm.location}
                onChange={(e) => setSignupForm({...signupForm, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, State"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mb-4"
            >
              Sign Up
            </button>
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  // Main render function
  if (currentScreen === 'login') {
    return <LoginScreen />;
  }

  if (currentScreen === 'requests') {
    return <RequestsScreen />;
  }

  if (currentScreen === 'profile') {
    return <ProfileScreen />;
  }

  return <HomeScreen />;
};

export default SkillSwapPlatform;
