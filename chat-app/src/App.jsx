/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import ChatScreen from "./components/ChatScreen";
import JoinScreen from "./components/JoinScreen";
import { API_BASE } from "./apiBase";

function App() {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
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

    const joinChat = async (userName) => {
        if (!userName.trim()) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/api/Users/Join`,
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
        // In the Base44 sandbox the preview proxy doesn't relay websocket/SSE
        // upgrades, so we force long-polling (plain HTTP) when VITE_API_URL is
        // set. Locally the default auto-negotiation is preserved.
        const hubOptions = import.meta.env.VITE_API_URL
            ? { transport: HttpTransportType.LongPolling }
            : {};

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE}/chatHub`, hubOptions)
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
            `${API_BASE}/api/messages`
        );

        if (!response.ok) {
            throw new Error("Failed to get messages");
        }

        const data = await response.json();

        setMessages(
            data.map(message => ({
                id: message.id,
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
            `${API_BASE}/api/users`
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
};

/*
 * JOIN SCREEN
 */
if (!currentUser) {
    return (
        <JoinScreen
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
        leaveChat={leaveChat}
        loading={loading} />
);
}

export default App;