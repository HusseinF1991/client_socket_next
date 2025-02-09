"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
// import Cookies from "js-cookie";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL; // Change if needed
// const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTRhZTY4LWViYTQtNzQ1MS05YmRlLTA0Mjk0MzM5Y2FjZSIsImlhdCI6MTczOTExNzM4MywiZXhwIjoxNzM5MTE4MjgzfQ.QNBAV1ZdMG3Xv17vYaUmsLaW3xHnqfOc6jEXv-0sKmg";

export default function SocketClient() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Store JWT token in a cookie
        // Cookies.set("access_token", access_token, {
        //     path: "/",
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        // });

        // Connect to WebSocket server
        const socketInstance = io(SOCKET_SERVER_URL, {
            // path: '/socket',
            withCredentials: true,
            query: { lang: 'ar' },
            transports: ["websocket"],
        });

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            console.log("Connected to WebSocket server");

            // socketInstance.on('reconnect', () => {
            //     console.log('Reconnected to server');
            //     // fetchMissedMessages(); get missed messages
            // });
        });

        socketInstance.on("RECEIVE_START_DIAGNOSIS", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socketInstance.on("RECEIVE_DIAGNOSIS_COMPLETED", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
        });// Handle connection errors

        socketInstance.on('error', (err) => {
            console.error('Connection error:', err.message);
        });


        socketInstance.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const sendDiagnosisCompleted = () => {
        if (socket) {
            socket.emit("SEND_DIAGNOSIS_COMPLETED", { patientId: "" });
        }
    };

    const sendStartDiagnosis = () => {
        if (socket) {
            socket.emit("SEND_START_DIAGNOSIS", { patientId: "" });
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Socket.IO Client</h1>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded mb-4 mr-4"
                onClick={sendDiagnosisCompleted}
            >
                Send diagnosis completed
            </button>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
                onClick={sendStartDiagnosis}
            >
                Send start diagnosis
            </button>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index} className="p-2 border-b">{msg}</li>
                ))}
            </ul>
        </div>
    );
}