"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AVAILABLE_EVENTS, EVENTS_TO_LISTEN } from "../socket-events";

// Provide a fallback URL if environment variable is not set
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";

export default function SocketClient() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [retryCount, setRetryCount] = useState<number>(0);
    const [serverUrl, setServerUrl] = useState<string>(SOCKET_SERVER_URL);

    //Obsolete : the user should login to connect to socket on cookies-based auth
    // const [cookieStatus, setCookieStatus] = useState<string>("");

    // New state for enhancements
    const [token, setToken] = useState<string>("");
    const [useTokenInCookies, setUseTokenInCookies] = useState<boolean>(true);
    const [selectedEvent, setSelectedEvent] = useState<string>(AVAILABLE_EVENTS[0].id);
    const [eventPayload, setEventPayload] = useState<string>(JSON.stringify(AVAILABLE_EVENTS[0].defaultPayload, null, 2));
    const [listeningEvents, setListeningEvents] = useState<string[]>(EVENTS_TO_LISTEN);
    const [socketPath, setSocketPath] = useState<string>("/socket");

    //Obsolete : the user should login to connect to socket on cookies-based auth
    /*     // Function to check if a cookie exists
        const checkCookieStatus = () => {
            const cookies = document.cookie;
            console.log("cookies", cookies);
            
            setCookieStatus(cookies);
            return cookies.includes("access_token");
        };
    
        // Set cookie function
        const setCookie = () => {
            // Store JWT token in a cookie with proper settings
            Cookies.set("access_token", token, {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: 1,
            });
    
            // Also try setting the cookie manually for older browsers
            document.cookie = `access_token=${token}; path=/; ${process.env.NODE_ENV === "production" ? 'secure;' : ''} samesite=lax; max-age=86400`;
            
            // Update cookie status
            checkCookieStatus();
            console.log("Cookie set:", document.cookie);
        }; */

    // Function to establish socket connection
    const connectToSocket = () => {
        if (socket) {
            // Disconnect existing socket if there is one
            socket.disconnect();
        }

        console.log("Manually connecting to:", serverUrl);
        setErrorMessage("");
        setConnectionStatus("Connecting...");


        //Obsolete : the user should login to connect to socket on cookies-based auth
        // Configure token based on selected method
        // if (useTokenInCookies) {
        //     setCookie();
        // }

        // Socket connection options
        const socketOptions: {
            withCredentials: boolean;
            query: { lang: string };
            transports: string[];
            timeout: number;
            reconnectionAttempts: number;
            reconnectionDelay: number;
            path?: string;
            auth?: { token: string };
        } = {
            withCredentials: useTokenInCookies, // Only use credentials if token is in cookies
            query: { lang: 'ar' },
            transports: ["websocket", "polling"],
            timeout: 10000,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        };

        // Add path only if it's not empty
        if (socketPath.trim() !== '') {
            socketOptions.path = socketPath;
        }

        // Add auth option if not using cookies
        if (!useTokenInCookies) {
            socketOptions.auth = {
                token: token
            }
        }

        // Connect to WebSocket server        console.log("socketOptions", socketOptions);
        const socketInstance = io(serverUrl, socketOptions);

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

        // Dynamically add event listeners based on listeningEvents array
        listeningEvents.forEach(eventName => {
            socketInstance.on(eventName, (message) => {
                console.log(`Received ${eventName} message:`, message);
                const formattedMessage = `${eventName}: ${JSON.stringify(message)}`;
                setMessages((prev) => [...prev, formattedMessage]);
            });
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err);
            console.error("Error message:", err.message);

            // Access potential extra data (Socket.IO errors might have additional properties)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorData = (err as any).data;
            if (errorData) console.error("Error data:", errorData);

            setConnectionStatus("Error");
            setErrorMessage(`Connection error: ${err.message}${errorData ? ` (${JSON.stringify(errorData)})` : ''}`);
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
        //Obsolete : the user should login to connect to socket on cookies-based auth
        // Check for existing cookies
        // checkCookieStatus();

        connectToSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    //Obsolete : the user should login to connect to socket on cookies-based auth
    // Update cookie status periodically
    // useEffect(() => {
    //     const cookieCheckInterval = setInterval(checkCookieStatus, 2000);
    //     return () => clearInterval(cookieCheckInterval);
    // }, []);

    // Function to handle sending events
    const sendEvent = () => {
        if (!socket) return;

        try {
            const payload = JSON.parse(eventPayload);

            socket.emit(selectedEvent, payload, (response: Record<string, unknown>) => {
                if (response.success === true) {
                    console.log(`${selectedEvent} sent successfully:`, response);
                    setMessages(prev => [...prev, `SENT ${selectedEvent}: ${JSON.stringify(payload)}`]);
                } else if (response.success === false) {
                    console.error('Error from server:', response.message);
                    setErrorMessage(`Error from server: ${String(response.message)}`);
                }
            });
        } catch (error) {
            console.error('Invalid JSON payload:', error);
            setErrorMessage('Invalid JSON payload. Please check your input.');
        }
    };

    // Set default payload when event selection changes
    const handleEventChange = (eventId: string) => {
        setSelectedEvent(eventId);
        const selectedEventObj = AVAILABLE_EVENTS.find(e => e.id === eventId);
        if (selectedEventObj) {
            setEventPayload(JSON.stringify(selectedEventObj.defaultPayload, null, 2));
        }
    };

    // Toggle event listening
    const toggleEventListener = (eventName: string) => {
        if (listeningEvents.includes(eventName)) {
            setListeningEvents(prev => prev.filter(e => e !== eventName));
        } else {
            setListeningEvents(prev => [...prev, eventName]);
        }
    };

    // Effect to update event listeners when listeningEvents changes
    useEffect(() => {
        if (socket) {
            // Reinstantiate connection with new listeners
            connectToSocket();
        }
    }, [listeningEvents]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Socket.IO Client</h1>

            {/* Connection Panel */}
            <div className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Connection Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Server URL</label>
                        <div className="flex">
                            <input
                                type="text"
                                value={serverUrl}
                                onChange={(e) => setServerUrl(e.target.value)}
                                placeholder="Socket server URL"
                                className="border border-gray-300 p-2 flex-1 rounded"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Socket Path (optional)</label>
                        <input
                            type="text"
                            value={socketPath}
                            onChange={(e) => setSocketPath(e.target.value)}
                            placeholder="Leave empty to use default"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Authentication Token</label>
                    <textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="JWT Token"
                        className="border border-gray-300 p-2 w-full rounded font-mono text-sm"
                        rows={3}
                        disabled={useTokenInCookies}
                    />
                    <div className="mt-2 flex items-center">
                        <input
                            type="checkbox"
                            id="useTokenInCookies"
                            checked={useTokenInCookies}
                            onChange={() => setUseTokenInCookies(!useTokenInCookies)}
                            className="mr-2"
                        />
                        <label htmlFor="useTokenInCookies" className="text-sm">
                            Use token in cookies (otherwise send in auth request)
                        </label>
                    </div>

                    {/* //Obsolete : the user should login to connect to socket on cookies-based auth */}
                    {/* {useTokenInCookies && (
                        <button
                            className="mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                            onClick={() => {
                                setCookie();
                                // Force rerender to show cookie status
                                setErrorMessage("Cookie set: " + token.substring(0, 15) + "...");
                                setTimeout(() => setErrorMessage(""), 2000);
                            }}
                        >
                            Force Set Cookie
                        </button>
                    )} */}
                </div>

                <div className="mb-2">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                        onClick={connectToSocket}
                    >
                        Connect
                    </button>
                </div>

                <div>
                    <p className="font-medium">Status:
                        <span
                            className={
                                connectionStatus === "Connected" ? "text-green-600 fontbold ml-2" :
                                    connectionStatus === "Reconnecting" ? "text-yellow-600 fontbold ml-2" :
                                        "text-red-600 font-bold ml-2"
                            }
                        >
                            {connectionStatus}
                            {connectionStatus === "Reconnecting" && ` (Attempt ${retryCount})`}
                        </span>
                    </p>
                    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

                    {/* //Obsolete : the user should login to connect to socket on cookies-based auth */}
                    {/*                     {useTokenInCookies && (
                        <div className="mt-2 p-2 bg-gray-200 rounded-sm">
                            <p className="text-xs font-mono">Cookie Status: {cookieStatus.includes("access_token") ?
                                <span className="text-green-600 font-bold">✓ access_token found</span> :
                                <span className="text-red-600 font-bold">✗ access_token not found</span>}
                            </p>
                            <p className="text-xs font-mono break-all">{cookieStatus || "No cookies set"}</p>
                        </div>
                    )} */}
                </div>
            </div>


            {/* Send Events Panel */}
            <div className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Send Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Event</label>
                        <select
                            value={selectedEvent}
                            onChange={(e) => handleEventChange(e.target.value)}
                            className="border border-gray-300 p-2 w-full rounded"
                        >
                            {AVAILABLE_EVENTS.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded w-full"
                            onClick={sendEvent}
                            disabled={!socket || connectionStatus !== "Connected"}
                        >
                            Send Event
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Event Payload (JSON)</label>
                    <textarea
                        value={eventPayload}
                        onChange={(e) => setEventPayload(e.target.value)}
                        rows={5}
                        className="border border-gray-300 p-2 w-full rounded font-mono text-sm"
                    />
                </div>
            </div>


            {/* Event Listeners Panel */}
            <div className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Event Listeners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {EVENTS_TO_LISTEN.map(eventName => (
                        <div key={eventName} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`listen-${eventName}`}
                                checked={listeningEvents.includes(eventName)}
                                onChange={() => toggleEventListener(eventName)}
                                className="mr-2"
                            />
                            <label htmlFor={`listen-${eventName}`}>{eventName}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages Panel */}
            <div className="bg-gray-100 p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Messages</h2>
                <div className="bg-white border rounded p-3 max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-gray-500">No messages received yet</p>
                    ) : (
                        <ul>
                            {messages.map((msg, index) => (
                                <li key={index} className="p-2 border-b font-mono text-sm break-all">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded"
                    onClick={() => setMessages([])}
                >
                    Clear Messages
                </button>
            </div>
        </div>
    );
}
