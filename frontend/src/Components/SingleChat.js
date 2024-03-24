import React from "react";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import "./styles.css";
import { Box, Text } from "@chakra-ui/layout";
import { Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
//import { ArrowBackIcon } from "@chakra-ui/icons";
//import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import ScrollableChat from "./ScrollableChat";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      //console.log(data);
      setMessages(data);
      setLoading(false);

      //socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    fetchMessages();

    //selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      //socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        //socket.emit("new message", data);
        //console.log(data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {selectedChat ? (
        <>
          {/* Chat messages */}
          <Box
            flex="1"
            overflowY="auto"
            p={3}
            bg="#E8E8E8"
            borderRadius="lg"
            position="relative" // Add position relative
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                ml="400px"
                mt="220px"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
          </Box>

          {/* Input box */}
          <FormControl onKeyDown={sendMessage} isRequired>
            <Input
              variant="filled"
              bg="#E0E0E0"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={typingHandler}
            />
          </FormControl>
        </>
      ) : (
        // Placeholder text when no chat selected
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="3xl">Click on a thread to start chatting</Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
