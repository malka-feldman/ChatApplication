/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        if (currentUser) {
            getMessages();
        }
    }, [currentUser]);

    const joinChat = async () => {
        if (!userName.trim()) {
            return;
        }

        try {
            const response = await fetch(
                "https://localhost:7087/api/Users/Join",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: userName
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to join chat");
            }

            const user = await response.json();

            setCurrentUser(user);
            getUsers();

            const newConnection = new HubConnectionBuilder()
                .withUrl("https://localhost:7087/chatHub")
                .withAutomaticReconnect()
                .build();

            setUpConnectionListeners(newConnection, user);

            await newConnection.start();
            await newConnection.invoke("JoinChat", user.id);

            setConnection(newConnection);

        } catch (error) {
            console.error("Error joining chat:", error);
        }
    };

    const setUpConnectionListeners = (connection, currentUser) => {

        //Sets current user to online
        connection.on("UserOnline", (userId) => {
            setUsers(currentUsers =>
                currentUsers.map(user =>
                    user.id === userId
                        ? { ...user, isOnline: true }
                        : user
                )
            );
        });

        //sets current user to offline
        connection.on("UserOffline", (userId) => {
            setUsers(currentUsers =>
                currentUsers.map(user =>
                    user.id === userId
                        ? { ...user, isOnline: false }
                        : user
                )
            );
        });

        //set users who are currently online to green
        connection.on("CurrentlyOnline", (onlineUserIds) => {
            setUsers(currentUsers =>
                currentUsers.map(user => ({
                    ...user,
                    isOnline: onlineUserIds.includes(user.id)
                }))
            );
        });

        //update messages array with newly created msg
        connection.on("ReceiveMessage", (message) => {
            setMessages(currentMessages => [
                ...currentMessages,
                {
                    text: message.body,
                    sender:
                        message.userId === currentUser.id
                            ? "sent"
                            : "received",
                    sentAt: message.sentAt,
                    userName: message.userName,
                    id: message.id,
                    userId: message.userId
                }
            ]);
        });

        //Add new user to users list
        connection.on("AddUser", (user) => {
            setUsers(currentUsers => {
                if (
                    currentUsers.some(
                        currentUser => currentUser.id === user.id
                    )
                ) {
                    return currentUsers;
                }

                return [
                    ...currentUsers,
                    user
                ];
            });
        });
    };

    const getMessages = async () => {
        try {
            const response = await fetch(
                "https://localhost:7087/api/messages"
            );

            if (!response.ok) {
                throw new Error("Failed to get messages");
            }

            const data = await response.json();

            setMessages(
                data.map(message => ({
                    text: message.body,
                    sender:
                        message.userId === currentUser?.id
                            ? "sent"
                            : "received",
                    sentAt: message.sentAt,
                    userName: message.userName,
                    userId: message.userId
                }))
            );

            setLoading(false);

        } catch (error) {
            console.error("Error getting messages:", error);
        }
    };

    const getUsers = async () => {
        try {
            const response = await fetch(
                "https://localhost:7087/api/users"
            );

            if (!response.ok) {
                throw new Error("Failed to get users");
            }

            const data = await response.json();

            setUsers(data);

        } catch (error) {
            console.error("Error getting users:", error);
        }
    };

    const leaveChat = async () => {
        if (connection) {
            await connection.stop();
        }

        setConnection(null);
        setCurrentUser(null);
        setUserName("")
    };

    const sendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        const newMessage = {
            userId: currentUser.id,
            body: message
        };

        try {
            const response = await fetch(
                "https://localhost:7087/api/messages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newMessage)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            setMessage("");

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    /*
     * JOIN SCREEN
     */
    if (!currentUser) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100"
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        width: 400,
                        p: 4,
                        borderRadius: 3
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        textAlign="center"
                        gutterBottom
                    >
                        Chat App
                    </Typography>

                    <Typography
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 3 }}
                    >
                        Enter your name to join the chat
                    </Typography>

                    <TextField
                        fullWidth
                        label="Your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                joinChat();
                            }
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={joinChat}
                        disabled={!userName.trim()}
                    >
                        Join Chat
                    </Button>
                </Paper>
            </Box>
        );
    }

    /*
     * CHAT SCREEN
     */
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "grey.100"
            }}
        >

            {/* HEADER */}
            <Box
                sx={{
                    height: 64,
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "primary.main",
                    color: "white"
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    Chat App
                </Typography>

                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={leaveChat}
                >
                    Leave Chat
                </Button>
            </Box>

            {/* MAIN CONTENT */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    minHeight: 0
                }}
            >

                {/* USERS SIDEBAR */}
                <Paper
                    square
                    elevation={1}
                    sx={{
                        width: 260,
                        flexShrink: 0,
                        overflowY: "auto"
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                        >
                            Users
                        </Typography>
                    </Box>

                    <Divider />

                    <List>
                        {users.map(user => (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar>
                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </Avatar>

                                        {/* Online indicator */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                width: 12,
                                                height: 12,
                                                borderRadius: "50%",
                                                bgcolor: user.isOnline
                                                    ? "success.main"
                                                    : "grey.400",
                                                border: "2px solid white"
                                            }}
                                        />
                                    </Box>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}
                                        >
                                            <Typography>
                                                {user.name}
                                            </Typography>

                                            {user.id === currentUser.id && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    (You)
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* CHAT AREA */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0
                    }}
                >

                    {/* MESSAGES */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            p: 3
                        }}
                    >
                        {loading ? (
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            messages.map(msg => (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: "flex",
                                        justifyContent:
                                            msg.sender === "sent"
                                                ? "flex-end"
                                                : "flex-start",
                                        mb: 2
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            maxWidth: "65%",
                                            borderRadius: 2,
                                            bgcolor:
                                                msg.sender === "sent"
                                                    ? "primary.main"
                                                    : "white",
                                            color:
                                                msg.sender === "sent"
                                                    ? "white"
                                                    : "text.primary"
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: "bold",
                                                display: "block",
                                                mb: 0.5,
                                                opacity: 0.8
                                            }}
                                        >
                                            {msg.userId === currentUser.id
                                                ? "You"
                                                : msg.userName}
                                        </Typography>

                                        <Typography>
                                            {msg.text}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "block",
                                                mt: 0.5,
                                                opacity: 0.7,
                                                textAlign: "right"
                                            }}
                                        >
                                            {msg.sentAt &&
                                                new Date(
                                                    msg.sentAt
                                                ).toLocaleTimeString([], {
                                                    hour: "numeric",
                                                    minute: "2-digit"
                                                })}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* MESSAGE INPUT */}
                    <Paper
                        square
                        elevation={3}
                        sx={{
                            p: 2,
                            display: "flex",
                            gap: 1
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={sendMessage}
                            disabled={!message.trim()}
                        >
                            Send
                        </Button>
                    </Paper>

                </Box>
            </Box>
        </Box>
    );
}

export default App;