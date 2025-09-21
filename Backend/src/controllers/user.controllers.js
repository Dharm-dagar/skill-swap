import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { uploadOnCloudinary } from "../config/connectCloudinary.js";
import { sendMail } from "../utils/SendMail.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

export const userDetailsWithoutID = asyncHandler(async (req, res) => {
  console.log("\n******** Inside userDetailsWithoutID Controller function ********");

  return res.status(200).json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

export const UserDetails = asyncHandler(async (req, res) => {
  console.log("\n******** Inside UserDetails Controller function ********");
  const username = req.params.username;

  const user = await User.findOne({ username: username });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const receiverID = user._id;
  const senderID = req.user._id;
  const request = await Request.find({
    $or: [
      { sender: senderID, receiver: receiverID },
      { sender: receiverID, receiver: senderID },
    ],
  });

  // console.log("request", request);

  const status = request.length > 0 ? request[0].status : "Connect";

  // console.log(" userDetail: ", userDetail);
  // console.log("user", user);
  return res
    .status(200)
    .json(new ApiResponse(200, { ...user._doc, status: status }, "User details fetched successfully"));
});

export const UnRegisteredUserDetails = asyncHandler(async (req, res) => {
  console.log("\n******** Inside UnRegisteredUserDetails Controller function ********");

  // console.log(" UnRegisteredUserDetail: ", userDetail);
  return res.status(200).json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

export const saveRegUnRegisteredUser = asyncHandler(async (req, res) => {
  console.log("\n******** Inside saveRegUnRegisteredUser Controller function ********");

  const { name, email, username, linkedinLink, githubLink, portfolioLink, skillsProficientAt, skillsToLearn } =
    req.body;
  // console.log("Body: ", req.body);

  if (!name || !email || !username || skillsProficientAt.length === 0 || skillsToLearn.length === 0) {
    throw new ApiError(400, "Please provide all the details");
  }

  if (!email.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)) {
    throw new ApiError(400, "Please provide valid email");
  }

  if (username.length < 3) {
    throw new ApiError(400, "Username should be atleast 3 characters long");
  }

  if (githubLink === "" && linkedinLink === "" && portfolioLink === "") {
    throw new ApiError(400, "Please provide atleast one link");
  }

  const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
  const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
  if ((linkedinLink && !linkedinLink.match(linkedinRegex)) || (githubLink && !githubLink.match(githubRegex))) {
    throw new ApiError(400, "Please provide valid github and linkedin links");
  }

  const existingUser = await User.findOne({ username: username });

  if (existingUser) {
    throw new ApiError(400, "Username already exists");
  }

  const user = await UnRegisteredUser.findOneAndUpdate(
    { email: email },
    {
      name: name,
      username: username,
      linkedinLink: linkedinLink,
      githubLink: githubLink,
      portfolioLink: portfolioLink,
      skillsProficientAt: skillsProficientAt,
      skillsToLearn: skillsToLearn,
    }
  );

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }
  // console.log(" UnRegisteredUserDetail: ", userDetail);
  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveEduUnRegisteredUser = asyncHandler(async (req, res) => {
  console.log("******** Inside saveEduUnRegisteredUser Function *******");

  const { education, email } = req.body;
  if (education.length === 0) {
    throw new ApiError(400, "Education is required");
  }
  education.forEach((edu) => {
    // console.log("Education: ", edu);
    if (!edu.institution || !edu.degree) {
      throw new ApiError(400, "Please provide all the details");
    }
    if (
      !edu.startDate ||
      !edu.endDate ||
      !edu.score ||
      edu.score < 0 ||
      edu.score > 100 ||
      edu.startDate > edu.endDate
    ) {
      throw new ApiError(400, "Please provide valid score and dates");
    }
  });

  const user = await UnRegisteredUser.findOneAndUpdate({ email: email }, { education: education });

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveAddUnRegisteredUser = asyncHandler(async (req, res) => {
  console.log("******** Inside saveAddUnRegisteredUser Function *******");

  const { bio, projects, email } = req.body;
  if (!bio) {
    throw new ApiError(400, "Bio is required");
  }
  if (bio.length > 500) {
    throw new ApiError(400, "Bio should be less than 500 characters");
  }

  if (projects.size > 0) {
    projects.forEach((project) => {
      if (!project.title || !project.description || !project.projectLink || !project.startDate || !project.endDate) {
        throw new ApiError(400, "Please provide all the details");
      }
      if (project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        throw new ApiError(400, "Please provide valid project link");
      }
      if (project.startDate > project.endDate) {
        throw new ApiError(400, "Please provide valid dates");
      }
    });
  }

  const user = await UnRegisteredUser.findOneAndUpdate({ email: email }, { bio: bio, projects: projects });

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const registerUser = async (req, res) => {
  console.log("\n******** Inside registerUser function ********");
  // First check if the user is already registered
  // if the user is already registerd than send a message that the user is already registered
  // redirect him to the discover page
  // if the user is not registered than create a new user and redirect him to the discover page after generating the token and setting the cookie and also delete the user detail from unregistered user from the database
  console.log("User:", req.user);

  const {
    name,
    email,
    username,
    linkedinLink,
    githubLink,
    portfolioLink,
    skillsProficientAt,
    skillsToLearn,
    education,
    bio,
    projects,
  } = req.body;

  if (!name || !email || !username || skillsProficientAt.length === 0 || skillsToLearn.length === 0) {
    throw new ApiError(400, "Please provide all the details");
  }
  if (!email.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)) {
    throw new ApiError(400, "Please provide valid email");
  }
  if (username.length < 3) {
    throw new ApiError(400, "Username should be atleast 3 characters long");
  }
  if (githubLink === "" && linkedinLink === "" && portfolioLink === "") {
    throw new ApiError(400, "Please provide atleast one link");
  }
  const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
  const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
  if ((linkedinLink && !linkedinLink.match(linkedinRegex)) || (githubLink && !githubLink.match(githubRegex))) {
    throw new ApiError(400, "Please provide valid github and linkedin links");
  }
  if (education.length === 0) {
    throw new ApiError(400, "Education is required");
  }
  education.forEach((edu) => {
    if (!edu.institution || !edu.degree) {
      throw new ApiError(400, "Please provide all the details");
    }
    if (
      !edu.startDate ||
      !edu.endDate ||
      !edu.score ||
      edu.score < 0 ||
      edu.score > 100 ||
      edu.startDate > edu.endDate
    ) {
      throw new ApiError(400, "Please provide valid score and dates");
    }
  });
  if (!bio) {
    throw new ApiError(400, "Bio is required");
  }
  if (bio.length > 500) {
    throw new ApiError(400, "Bio should be less than 500 characters");
  }
  if (projects.size > 0) {
    projects.forEach((project) => {
      if (!project.title || !project.description || !project.projectLink || !project.startDate || !project.endDate) {
        throw new ApiError(400, "Please provide all the details");
      }
      if (project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        throw new ApiError(400, "Please provide valid project link");
      }
      if (project.startDate > project.endDate) {
        throw new ApiError(400, "Please provide valid dates");
      }
    });
  }

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    throw new ApiError(400, "User Already registered");
  }

  const checkUsername = await User.findOne({ username: username });
  if (checkUsername) {
    throw new ApiError(400, "Username already exists");
  }

  const newUser = await User.create({
    name: name,
    email: email,
    username: username,
    linkedinLink: linkedinLink,
    githubLink: githubLink,
    portfolioLink: portfolioLink,
    skillsProficientAt: skillsProficientAt,
    skillsToLearn: skillsToLearn,
    education: education,
    bio: bio,
    projects: projects,
    picture: req.user.picture,
  });

  if (!newUser) {
    throw new ApiError(500, "Error in saving user details");
  }

  await UnRegisteredUser.findOneAndDelete({ email: email });

  const jwtToken = generateJWTToken_username(newUser);
  const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
  res.cookie("accessToken", jwtToken, { httpOnly: true, expires: expiryDate, secure: false });
  res.clearCookie("accessTokenRegistration");
  return res.status(200).json(new ApiResponse(200, newUser, "NewUser registered successfully"));
};

export const saveRegRegisteredUser = asyncHandler(async (req, res) => {
  console.log("******** Inside saveRegRegisteredUser Function *******");

  const { name, username, linkedinLink, githubLink, portfolioLink, skillsProficientAt, skillsToLearn, picture } =
    req.body;

  console.log("Body: ", req.body);

  if (!name || !username || skillsProficientAt.length === 0 || skillsToLearn.length === 0) {
    throw new ApiError(400, "Please provide all the details");
  }

  if (username.length < 3) {
    throw new ApiError(400, "Username should be atleast 3 characters long");
  }

  if (githubLink === "" && linkedinLink === "" && portfolioLink === "") {
    throw new ApiError(400, "Please provide atleast one link");
  }

  const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
  const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
  if ((linkedinLink && !linkedinLink.match(linkedinRegex)) || (githubLink && !githubLink.match(githubRegex))) {
    throw new ApiError(400, "Please provide valid github and linkedin links");
  }

  const user = await User.findOneAndUpdate(
    { username: req.user.username },
    {
      name: name,
      username: username,
      linkedinLink: linkedinLink,
      githubLink: githubLink,
      portfolioLink: portfolioLink,
      skillsProficientAt: skillsProficientAt,
      skillsToLearn: skillsToLearn,
      picture: picture,
    }
  );

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveEduRegisteredUser = asyncHandler(async (req, res) => {
  console.log("******** Inside saveEduRegisteredUser Function *******");

  const { education } = req.body;

  if (education.length === 0) {
    throw new ApiError(400, "Education is required");
  }

  education.forEach((edu) => {
    if (!edu.institution || !edu.degree) {
      throw new ApiError(400, "Please provide all the details");
    }
    if (
      !edu.startDate ||
      !edu.endDate ||
      !edu.score ||
      edu.score < 0 ||
      edu.score > 100 ||
      edu.startDate > edu.endDate
    ) {
      throw new ApiError(400, "Please provide valid score and dates");
    }
  });

  const user = await User.findOneAndUpdate({ username: req.user.username }, { education: education });

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

export const saveAddRegisteredUser = asyncHandler(async (req, res) => {
  console.log("******** Inside saveAddRegisteredUser Function *******");

  const { bio, projects } = req.body;

  if (!bio) {
    throw new ApiError(400, "Bio is required");
  }

  if (bio.length > 500) {
    throw new ApiError(400, "Bio should be less than 500 characters");
  }

  if (projects.size > 0) {
    projects.forEach((project) => {
      if (!project.title || !project.description || !project.projectLink || !project.startDate || !project.endDate) {
        throw new ApiError(400, "Please provide all the details");
      }
      if (project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        throw new ApiError(400, "Please provide valid project link");
      }
      if (project.startDate > project.endDate) {
        throw new ApiError(400, "Please provide valid dates");
      }
    });
  }

  const user = await User.findOneAndUpdate({ username: req.user.username }, { bio: bio, projects: projects });

  if (!user) {
    throw new ApiError(500, "Error in saving user details");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
});

// export const updateRegisteredUser = asyncHandler(async (req, res) => {
//   console.log("******** Inside updateRegisteredUser Function *******");

//   const {
//     name,
//     username,
//     linkedinLink,
//     githubLink,
//     portfolioLink,
//     skillsProficientAt,
//     skillsToLearn,
//     education,
//     bio,
//     projects,
//   } = req.body;

//   if (!name || !username || skillsProficientAt.length === 0 || skillsToLearn.length === 0) {
//     throw new ApiError(400, "Please provide all the details");
//   }

//   if (username.length < 3) {
//     throw new ApiError(400, "Username should be atleast 3 characters long");
//   }

//   if (githubLink === "" && linkedinLink === "" && portfolioLink === "") {
//     throw new ApiError(400, "Please provide atleast one link");
//   }

//   const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
//   const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
//   if ((linkedinLink && !linkedinLink.match(linkedinRegex)) || (githubLink && !githubLink.match(githubRegex))) {
//     throw new ApiError(400, "Please provide valid github and linkedin links");
//   }

//   if (education.length === 0) {
//     throw new ApiError(400, "Education is required");
//   }

//   education.forEach((edu) => {
//     if (!edu.institution || !edu.degree) {
//       throw new ApiError(400, "Please provide all the details");
//     }
//     if (
//       !edu.startDate ||
//       !edu.endDate ||
//       !edu.score ||
//       edu.score < 0 ||
//       edu.score > 100 ||
//       edu.startDate > edu.endDate
//     ) {
//       throw new ApiError(400, "Please provide valid score and dates");
//     }
//   });

//   if (!bio) {
//     throw new ApiError(400, "Bio is required");
//   }

//   if (bio.length > 500) {
//     throw new ApiError(400, "Bio should be less than 500 characters");
//   }

//   if (projects.size > 0) {
//     projects.forEach((project) => {
//       if (!project.title || !project.description || !project.projectLink || !project.startDate || !project.endDate) {
//         throw new ApiError(400, "Please provide all the details");
//       }
//       if (project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
//         throw new ApiError(400, "Please provide valid project link");
//       }
//       if (project.startDate > project.endDate) {
//         throw new ApiError(400, "Please provide valid dates");
//       }
//     });
//   }

//   const user = await User.findOneAndUpdate(
//     { username: req.user.username },
//     {
//       name: name,
//       username: username,
//       linkedinLink: linkedinLink,
//       githubLink: githubLink,
//       portfolioLink: portfolioLink,
//       skillsProficientAt: skillsProficientAt,
//       skillsToLearn: skillsToLearn,
//       education: education,
//       bio: bio,
//       projects: projects,
//     }
//   );

//   if (!user) {
//     throw new ApiError(500, "Error in saving user details");
//   }

//   return res.status(200).json(new ApiResponse(200, user, "User details saved successfully"));
// });

export const uploadPic = asyncHandler(async (req, res) => {
  const LocalPath = req.files?.picture[0]?.path;

  if (!LocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const picture = await uploadOnCloudinary(LocalPath);
  if (!picture) {
    throw new ApiError(500, "Error uploading picture");
  }

  res.status(200).json(new ApiResponse(200, { url: picture.url }, "Picture uploaded successfully"));
});

export const discoverUsers = asyncHandler(async (req, res) => {
  console.log("******** Inside discoverUsers Function *******");

  const webDevSkills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "MongoDB",
    "SQL",
    "NoSQL",
  ];

  const machineLearningSkills = [
    "Python",
    "Natural Language Processing",
    "Deep Learning",
    "PyTorch",
    "Machine Learning",
  ];

  // Find all the users except the current users who are proficient in the skills that the current user wants to learn and also the the users who are proficient in the web development skills and machine learning skills in the array above
  //

  //  fetch all users except the current user

  const users = await User.find({ username: { $ne: req.user.username } });

  // now make three seperate list of the users who are proficient in the skills that the current user wants to learn, the users who are proficient in the web development skills and the users who are proficient in the machine learning skills and others also limit the size of the array to 5;

  // const users = await User.find({
  //   skillsProficientAt: { $in: req.user.skillsToLearn },
  //   username: { $ne: req.user.username },
  // });

  if (!users) {
    throw new ApiError(500, "Error in fetching users");
  }
  const usersToLearn = [];
  const webDevUsers = [];
  const mlUsers = [];
  const otherUsers = [];

  // randomly suffle the users array

  users.sort(() => Math.random() - 0.5);

  users.forEach((user) => {
    if (user.skillsProficientAt.some((skill) => req.user.skillsToLearn.includes(skill)) && usersToLearn.length < 5) {
      usersToLearn.push(user);
    } else if (user.skillsProficientAt.some((skill) => webDevSkills.includes(skill)) && webDevUsers.length < 5) {
      webDevUsers.push(user);
    } else if (user.skillsProficientAt.some((skill) => machineLearningSkills.includes(skill)) && mlUsers.length < 5) {
      mlUsers.push(user);
    } else {
      if (otherUsers.length < 5) otherUsers.push(user);
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { forYou: usersToLearn, webDev: webDevUsers, ml: mlUsers, others: otherUsers },
        "Users fetched successfully"
      )
    );
});

export const sendScheduleMeet = asyncHandler(async (req, res) => {
  console.log("******** Inside sendScheduleMeet Function *******");

  const { date, time, username } = req.body;
  if (!date || !time || !username) {
    throw new ApiError(400, "Please provide all the details");
  }

  const user = await User.findOne({ username: username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const to = user.email;
  const subject = "Request for Scheduling a meeting";
  const message = `${req.user.name} has requested for a meet at ${time} time on ${date} date. Please respond to the request.`;

  await sendMail(to, subject, message);

  // Create or find chat between requester and recipient, then send a callRequest message
  const requesterId = req.user._id;
  const recipientId = user._id;

  let chat = await Chat.findOne({ users: { $all: [requesterId, recipientId] } });
  if (!chat) {
    chat = await Chat.create({ users: [requesterId, recipientId] });
  }

  const content = `${req.user.name} requested a video call on ${date} at ${time}`;

  let callRequestMessage = await Message.create({
    chatId: chat._id,
    sender: requesterId,
    content: content,
    type: "callRequest",
  });

  callRequestMessage = await callRequestMessage.populate("sender", "username name email picture");
  callRequestMessage = await callRequestMessage.populate("chatId");
  callRequestMessage = await User.populate(callRequestMessage, {
    path: "chatId.users",
    select: "username name email picture",
  });

  await Chat.findByIdAndUpdate(
    { _id: chat._id },
    {
      latestMessage: callRequestMessage,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, callRequestMessage, "Email sent and call request posted to chat"));
});


/**
 * Search for users based on various criteria
 * @route GET /api/users/search
 * @param {string} query - Search query (can be skill, name, username, or bio content)
 * @param {string} category - Optional category filter (skills, name, bio, all)
 * @param {number} limit - Number of results to return (default: 10, max: 50)
 * @param {number} page - Page number for pagination (default: 1)
 * @param {string} sortBy - Sort by: relevance, rating, recent, name (default: relevance)
 */
export const searchUsers = asyncHandler(async (req, res) => {
  console.log("******** Inside searchUsers Function *******");
  
  const { 
    query, 
    category = "all", 
    limit = 10, 
    page = 1, 
    sortBy = "relevance" 
  } = req.query;

  // Validate input
  if (!query || query.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters long");
  }

  const searchQuery = query.trim();
  const limitNum = Math.min(parseInt(limit) || 10, 50); // Max 50 results
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const skip = (pageNum - 1) * limitNum;

  // Build MongoDB aggregation pipeline
  let pipeline = [];

  // Exclude current user if authenticated
  const excludeFilter = req.user ? { username: { $ne: req.user.username } } : {};
  pipeline.push({ $match: excludeFilter });

  // Create search conditions based on category
  let searchConditions = [];

  if (category === "all" || category === "skills") {
    // Search in skills (case-insensitive, partial match)
    searchConditions.push(
      {
        skillsProficientAt: {
          $elemMatch: { $regex: searchQuery, $options: "i" }
        }
      },
      {
        skillsToLearn: {
          $elemMatch: { $regex: searchQuery, $options: "i" }
        }
      }
    );
  }

  if (category === "all" || category === "name") {
    // Search in name and username
    searchConditions.push(
      { name: { $regex: searchQuery, $options: "i" } },
      { username: { $regex: searchQuery, $options: "i" } }
    );
  }

  if (category === "all" || category === "bio") {
    // Search in bio
    searchConditions.push(
      { bio: { $regex: searchQuery, $options: "i" } }
    );
  }

  if (category === "all" || category === "projects") {
    // Search in project titles and descriptions
    searchConditions.push(
      {
        "projects.title": { $regex: searchQuery, $options: "i" }
      },
      {
        "projects.description": { $regex: searchQuery, $options: "i" }
      },
      {
        "projects.techStack": {
          $elemMatch: { $regex: searchQuery, $options: "i" }
        }
      }
    );
  }

  if (category === "all" || category === "education") {
    // Search in education
    searchConditions.push(
      {
        "education.institution": { $regex: searchQuery, $options: "i" }
      },
      {
        "education.degree": { $regex: searchQuery, $options: "i" }
      }
    );
  }

  // Apply search conditions
  if (searchConditions.length > 0) {
    pipeline.push({
      $match: {
        $or: searchConditions
      }
    });
  }

  // Add relevance score calculation
  pipeline.push({
    $addFields: {
      relevanceScore: {
        $sum: [
          // Exact skill matches get highest score
          {
            $size: {
              $filter: {
                input: "$skillsProficientAt",
                cond: { $eq: [{ $toLower: "$$this" }, searchQuery.toLowerCase()] }
              }
            }
          },
          // Partial skill matches
          {
            $multiply: [
              0.8,
              {
                $size: {
                  $filter: {
                    input: "$skillsProficientAt",
                    cond: {
                      $regexMatch: {
                        input: { $toLower: "$$this" },
                        regex: searchQuery.toLowerCase()
                      }
                    }
                  }
                }
              }
            ]
          },
          // Skills to learn matches
          {
            $multiply: [
              0.6,
              {
                $size: {
                  $filter: {
                    input: "$skillsToLearn",
                    cond: {
                      $regexMatch: {
                        input: { $toLower: "$$this" },
                        regex: searchQuery.toLowerCase()
                      }
                    }
                  }
                }
              }
            ]
          },
          // Name matches
          {
            $cond: [
              { $regexMatch: { input: { $toLower: "$name" }, regex: searchQuery.toLowerCase() } },
              0.7,
              0
            ]
          },
          // Username matches
          {
            $cond: [
              { $regexMatch: { input: { $toLower: "$username" }, regex: searchQuery.toLowerCase() } },
              0.5,
              0
            ]
          },
          // Bio matches
          {
            $cond: [
              { $regexMatch: { input: { $toLower: "$bio" }, regex: searchQuery.toLowerCase() } },
              0.3,
              0
            ]
          },
          // Rating boost for high-rated users
          { $multiply: ["$rating", 0.1] }
        ]
      }
    }
  });

  // Apply sorting
  let sortStage = {};
  switch (sortBy) {
    case "rating":
      sortStage = { rating: -1, relevanceScore: -1 };
      break;
    case "recent":
      sortStage = { createdAt: -1, relevanceScore: -1 };
      break;
    case "name":
      sortStage = { name: 1 };
      break;
    case "relevance":
    default:
      sortStage = { relevanceScore: -1, rating: -1 };
      break;
  }

  pipeline.push({ $sort: sortStage });

  // Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limitNum });

  // Project only necessary fields
  pipeline.push({
    $project: {
      username: 1,
      name: 1,
      picture: 1,
      bio: 1,
      skillsProficientAt: 1,
      skillsToLearn: 1,
      rating: 1,
      linkedinLink: 1,
      githubLink: 1,
      portfolioLink: 1,
      relevanceScore: 1,
      // Include limited education and projects info
      education: {
        $slice: ["$education", 2] // Show only first 2 education entries
      },
      projects: {
        $slice: [
          {
            $map: {
              input: "$projects",
              as: "project",
              in: {
                title: "$$project.title",
                description: "$$project.description",
                techStack: "$$project.techStack"
              }
            }
          },
          3 // Show only first 3 projects
        ]
      }
    }
  });

  // Execute the aggregation
  const users = await User.aggregate(pipeline);

  // Get total count for pagination (run separate query for performance)
  const countPipeline = [
    { $match: excludeFilter },
    {
      $match: searchConditions.length > 0 ? { $or: searchConditions } : {}
    },
    { $count: "total" }
  ];

  const countResult = await User.aggregate(countPipeline);
  const totalResults = countResult.length > 0 ? countResult[0].total : 0;

  // Calculate pagination info
  const totalPages = Math.ceil(totalResults / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  // Prepare response data
  const responseData = {
    users,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalResults,
      hasNextPage,
      hasPrevPage,
      resultsPerPage: limitNum
    },
    searchInfo: {
      query: searchQuery,
      category,
      sortBy,
      resultsCount: users.length
    }
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      `Found ${users.length} users matching "${searchQuery}"`
    )
  );
});

/**
 * Get trending skills based on user data
 * @route GET /api/users/trending-skills
 * @param {number} limit - Number of skills to return (default: 10, max: 20)
 */
export const getTrendingSkills = asyncHandler(async (req, res) => {
  console.log("******** Inside getTrendingSkills Function *******");
  
  const { limit = 10 } = req.query;
  const limitNum = Math.min(parseInt(limit) || 10, 20);

  // Aggregate trending skills from both skillsProficientAt and skillsToLearn
  const pipeline = [
    {
      $project: {
        allSkills: {
          $concatArrays: ["$skillsProficientAt", "$skillsToLearn"]
        }
      }
    },
    { $unwind: "$allSkills" },
    {
      $match: {
        allSkills: { $ne: "" } // Exclude empty strings
      }
    },
    {
      $group: {
        _id: { $toLower: "$allSkills" }, // Case insensitive grouping
        count: { $sum: 1 },
        originalName: { $first: "$allSkills" }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limitNum
    },
    {
      $project: {
        _id: 0,
        skill: "$originalName",
        count: 1
      }
    }
  ];

  const trendingSkills = await User.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(
      200,
      { skills: trendingSkills },
      "Trending skills fetched successfully"
    )
  );
});

/**
 * Get skill suggestions based on partial input
 * @route GET /api/users/skill-suggestions
 * @param {string} input - Partial skill name
 * @param {number} limit - Number of suggestions (default: 5, max: 10)
 */
export const getSkillSuggestions = asyncHandler(async (req, res) => {
  console.log("******** Inside getSkillSuggestions Function *******");
  
  const { input, limit = 5 } = req.query;

  if (!input || input.trim().length < 1) {
    throw new ApiError(400, "Input parameter is required");
  }

  const searchInput = input.trim();
  const limitNum = Math.min(parseInt(limit) || 5, 10);

  const pipeline = [
    {
      $project: {
        allSkills: {
          $concatArrays: ["$skillsProficientAt", "$skillsToLearn"]
        }
      }
    },
    { $unwind: "$allSkills" },
    {
      $match: {
        allSkills: {
          $regex: searchInput,
          $options: "i"
        }
      }
    },
    {
      $group: {
        _id: { $toLower: "$allSkills" },
        skill: { $first: "$allSkills" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limitNum
    },
    {
      $project: {
        _id: 0,
        skill: 1,
        count: 1
      }
    }
  ];

  const suggestions = await User.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(
      200,
      { suggestions },
      `Found ${suggestions.length} skill suggestions`
    )
  );
});