import {
  Box,
  Menu,
  MenuButton,
  Text,
  Button,
  MenuList,
  MenuItem,
  MenuDivider,
  Image,
} from "@chakra-ui/react";
import logoImage from "../../../src/klogo.jpg";
import { useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/hooks";

const SideDrawer = () => {
  const { user } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  return (
    <>
      <Box
        style={{ display: "flex", alignItems: "center" }}
        bg="black"
        p="5px 10px"
        borderWidth="5px"
      >
        <Image src={logoImage} alt="Logo" boxSize="100px" />
        <Text
          fontSize="3xl"
          fontFamily="neon"
          ml="550px"
          textColor="white"
        >
          Kalaiaattam
        </Text>
        <Box d="flex" alignItems="center" ml="auto">
          <Menu>
            <MenuButton as={Button} variant="ghost" p={1}>
              <BellIcon fontSize="2xl" m={1} color="white" />
            </MenuButton>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default SideDrawer;
