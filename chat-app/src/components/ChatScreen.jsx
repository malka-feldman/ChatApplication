import {
    Box,
    Paper,
    Typography,
    Button,
    Divider,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Avatar,
    CircularProgress,
    TextField
} from "@mui/material";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import ForumIcon from "@mui/icons-material/Forum";
import { API_BASE } from "../apiBase";

function ChatScreen({
    users,
    currentUser,
    messages,
    loading,
    leaveChat,
    activeChat,
    onSelectChat,
})

{
    const [message, setMessage] = useState("");

    const sendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        const newMessage = {
            userId: currentUser.id,
            body: message,
            recipientId: activeChat ? activeChat.id : null
        };

        try {
            const response = await fetch(
                `${API_BASE}/api/messages`,
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
                        <ListItemButton
                            selected={!activeChat}
                            onClick={() => onSelectChat(null)}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                    <ForumIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography fontWeight="bold">
                                        Public Chat
                                    </Typography>
                                }
                            />
                        </ListItemButton>

                        <Divider sx={{ my: 1 }} />

                        {users.map(user => (
                            <ListItemButton
                                key={user.id}
                                selected={activeChat?.id === user.id}
                                onClick={() => onSelectChat(user)}
                            >
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
                            </ListItemButton>
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

                    {/* CONVERSATION HEADER */}
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: "divider",
                            bgcolor: "grey.50"
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            {activeChat
                                ? `Direct message with ${activeChat.name}`
                                : "Public Chat"}
                        </Typography>
                    </Box>

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

export default ChatScreen;