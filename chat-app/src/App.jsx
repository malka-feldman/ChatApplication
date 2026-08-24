/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import ChatScreen from "./components/ChatScreen";
import JoinScreen from "./components/JoinScreen";

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);


    useEffect(() => {
        const initializeUser = async () => {
            const savedUserId = sessionStorage.getItem("currentUserId");
            const users = await getUsers();
            if (savedUserId) {
                const savedUser = users.find(
                    u => u.id == savedUserId
                );

                if (savedUser) {
                    setCurrentUser(savedUser);
                    connectToChat(savedUser);
                }
            }
        };

        initializeUser();
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
            sessionStorage.setItem("currentUserId", user.id.toString());
            setCurrentUser(user);
            getUsers();
            connectToChat(user)

        } catch (error) {
            console.error("Error joining chat:", error);
        }
    };

    const connectToChat = async (user) => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7087/chatHub")
            .withAutomaticReconnect()
            .build();

        setUpConnectionListeners(newConnection, user);

        await newConnection.start();
        await newConnection.invoke("JoinChat", user.id);

        setConnection(newConnection);
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
        setUsers(currentUsers => [
            ...currentUsers,
            user
        ]);
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

        return data;

    } catch (error) {
        console.error("Error getting users:", error);
        return [];
    }
};

const leaveChat = async () => {
    if (connection) {
        await connection.stop();
    }
    sessionStorage.removeItem("currentUserId");
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
        <JoinScreen
            userName={userName}
            setUserName={setUserName}
            joinChat={joinChat}
        />
    );
}

/*
 * CHAT SCREEN
 */
return (
    <ChatScreen
        currentUser={currentUser}
        users={users}
        messages={messages}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        leaveChat={leaveChat}
        loading={loading} />
);
}

export default App;