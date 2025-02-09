"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
// import Cookies from "js-cookie";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL; // Change if needed
// const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTRhZTY4LWViYTQtNzQ1MS05YmRlLTA0Mjk0MzM5Y2FjZSIsImlhdCI6MTczOTExNzM4MywiZXhwIjoxNzM5MTE4MjgzfQ.QNBAV1ZdMG3Xv17vYaUmsLaW3xHnqfOc6jEXv-0sKmg";

export default function SocketClient() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputPatientId, setInputPatientId] = useState<string>("");

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
            socket.emit("SEND_DIAGNOSIS_COMPLETED", { patientId: "" }, (response: Record<string, boolean>) => {
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
            socket.emit("SEND_START_DIAGNOSIS", { patientId: "" }, (response: Record<string, boolean>) => {
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
                >
                    Send diagnosis completed
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
                    onClick={sendStartDiagnosis}
                >
                    Send start diagnosis
                </button>
            </div>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index} className="p-2 border-b">{msg}</li>
                ))}
            </ul>
        </div>
    );
}