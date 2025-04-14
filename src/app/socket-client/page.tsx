"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Cookies from "js-cookie";

// Provide a fallback URL if environment variable is not set
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTRjNzJkLWE1YWYtN2IzYy05NWE5LWY0MDgxZjNkYjY0ZiIsImlhdCI6MTc0NDY1NTU4MywiZXhwIjoxNzQ0NjU2NDgzfQ.mZ473QCICoL1xj7WafJCTTxfHhHCRc8YEYaddwrK0rs";

export default function SocketClient() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputPatientId, setInputPatientId] = useState<string>("");
    const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [retryCount, setRetryCount] = useState<number>(0);
    const [serverUrl, setServerUrl] = useState<string>(SOCKET_SERVER_URL);

    // Function to establish socket connection
    const connectToSocket = () => {
        if (socket) {
            // Disconnect existing socket if there is one
            socket.disconnect();
        }

        console.log("Manually connecting to:", serverUrl);
        setErrorMessage("");
        setConnectionStatus("Connecting...");

        // Connect to WebSocket server with improved options
        const socketInstance = io(serverUrl, {
            path: '/socket',
            withCredentials: true,
            query: { lang: 'ar' },
            transports: ["websocket", "polling"], // fallback to polling if websocket fails
            timeout: 10000, // 10 seconds timeout
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(socketInstance);

        // Setup all event listeners
        socketInstance.on("connect", () => {
            console.log("Connected to WebSocket server");
            setConnectionStatus("Connected");
            setErrorMessage("");
            setRetryCount(0);

            socketInstance.on('reconnect', (attemptNumber) => {
                console.log('Reconnected to server after', attemptNumber, 'attempts');
                setConnectionStatus("Connected");
                setErrorMessage("");
            });
        });

        socketInstance.on("RECEIVE_START_DIAGNOSIS", (message) => {
            console.log("Received start diagnosis message:", message);
            setMessages((prev) => [...prev, JSON.stringify(message)]);
        });

        socketInstance.on("RECEIVE_DIAGNOSIS_COMPLETED", (message) => {
            console.log("Received diagnosis completed message:", message);
            setMessages((prev) => [...prev, JSON.stringify(message)]);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
            setConnectionStatus("Error");
            setErrorMessage(`Connection error: ${err.message}`);
        });

        socketInstance.on('error', (err) => {
            console.error('Socket error:', err.message);
            setConnectionStatus("Error");
            setErrorMessage(`Socket error: ${err.message}`);
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            console.log('Attempting to reconnect:', attemptNumber);
            setRetryCount(attemptNumber);
            setConnectionStatus("Reconnecting");
        });

        socketInstance.on('reconnect_error', (err) => {
            console.error('Reconnection error:', err.message);
            setErrorMessage(`Reconnection error: ${err.message}`);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('Failed to reconnect');
            setConnectionStatus("Failed");
            setErrorMessage("Failed to reconnect after maximum attempts");
        });

        socketInstance.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
            setConnectionStatus("Disconnected");
        });
    };

    // Initial connection on component mount
    useEffect(() => {
        // Store JWT token in a cookie
        Cookies.set("access_token", access_token, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        connectToSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const sendDiagnosisCompleted = () => {
        if (socket) {
            socket.emit("SEND_DIAGNOSIS_COMPLETED", { patientId: inputPatientId }, (response: Record<string, boolean>) => {
                if (response.success === true) {
                    console.log('diagnosis completed state notification is sent successfully:', response);
                } else if (response.success === false) {
                    console.error('Error from server:', response.message);
                }
            });
        }
    };

    const sendStartDiagnosis = () => {
        if (socket) {
            socket.emit("SEND_START_DIAGNOSIS", { patientId: inputPatientId }, (response: Record<string, boolean>) => {
                if (response.success === true) {
                    console.log('diagnosis started state notification is sent successfully:', response);
                } else if (response.success === false) {
                    console.error('Error from server:', response.message);
                }
            });
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Socket.IO Client</h1>
            
            <div className="mb-4 bg-gray-100 p-3 rounded">
                <p className="font-semibold">Connection Info:</p>
                <div className="flex items-center my-2">
                    <input
                        type="text"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="Socket server URL"
                        className="border border-gray-300 p-2 flex-1 rounded-l"
                    />
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-r"
                        onClick={connectToSocket}
                    >
                        Reconnect
                    </button>
                </div>
                <p>Status: <span 
                    className={
                        connectionStatus === "Connected" ? "text-green-600 font-bold" : 
                        connectionStatus === "Reconnecting" ? "text-yellow-600 font-bold" : 
                        "text-red-600 font-bold"
                    }
                >
                    {connectionStatus}
                    {connectionStatus === "Reconnecting" && ` (Attempt ${retryCount})`}
                </span></p>
                {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            </div>

            <div className="flex mb-4">
                <input
                    type="text"
                    value={inputPatientId}
                    onChange={(e) => setInputPatientId(e.target.value)}
                    placeholder="Type patient id..."
                    className="border border-gray-300 p-2 flex-1 rounded-l mr-4"
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded mb-4 mr-4"
                    onClick={sendDiagnosisCompleted}
                    disabled={!socket || connectionStatus !== "Connected"}
                >
                    Send diagnosis completed
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
                    onClick={sendStartDiagnosis}
                    disabled={!socket || connectionStatus !== "Connected"}
                >
                    Send start diagnosis
                </button>
            </div>
            <div className="bg-gray-100 p-3 rounded">
                <h2 className="font-semibold mb-2">Messages:</h2>
                {messages.length === 0 ? (
                    <p className="text-gray-500">No messages received yet</p>
                ) : (
                    <ul>
                        {messages.map((msg, index) => (
                            <li key={index} className="p-2 border-b">{msg}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}