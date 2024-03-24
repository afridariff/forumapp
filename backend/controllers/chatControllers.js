const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");


const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected





// const createGroupChat = asyncHandler(async (req, res) => {
//   if (!req.body.users || !req.body.name) {
//     return res.status(400).send({ message: "Please Fill all the feilds" });
//   }

//   var users = JSON.parse(req.body.users);

//   if (users.length < 2) {
//     return res
//       .status(400)
//       .send("More than 2 users are required to form a group chat");
//   }

//   users.push(req.user);

//   try {
//     const groupChat = await Chat.create({
//       chatName: req.body.name,
//       users: users,
//       isGroupChat: true,
//       groupAdmin: req.user,
//     });

//     const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");

//     res.status(200).json(fullGroupChat);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });


const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ message: "Please provide a chat name" });
  }

  try {
    // Fetch all users except the current user
    const allUsers = await User.find({ _id: { $ne: req.user._id } });

    // Extract user IDs
    const userIds = allUsers.map((user) => user._id);

    // Add current user to the list of users
    userIds.push(req.user._id);

    // Create group chat
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: userIds,
      isGroupChat: true,
      groupAdmin: req.user._id, // Assuming group admin is the creator
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});





// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});
// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});



const deleteGroupChat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Find the group chat by id
    const groupChat = await Chat.findById(id);

    if (!groupChat) {
      res.status(404);
      throw new Error("Group Chat Not Found");
    }

    // Check if the requester is the admin of the group chat
    if (groupChat.groupAdmin.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to delete this group chat");
    }

    // Delete the group chat
    await groupChat.remove();

    res.json({ message: "Group chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  deleteGroupChat,
};
