import { useEffect, useRef } from "react";

const FALLBACK_POLL_INTERVAL = 2 * 60 * 1000;
const MAX_RECONNECT_DELAY = 30 * 1000;

function buildSocketUrl(baseUrl, params) {
    if (!baseUrl) return null;

    try {
        const url = new URL(baseUrl);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    } catch {
        return null;
    }
}

function shouldSyncByMessage(payload, consultationId) {
    if (!payload || typeof payload !== "object") {
        return true;
    }

    if (!consultationId) {
        return true;
    }

    const messageConsultationId =
        payload.consultation_id ??
        payload.consultationId ??
        payload.data?.consultation_id;

    return (
        !messageConsultationId ||
        String(messageConsultationId) === String(consultationId)
    );
}

export function useConsultationRealtime({
    role,
    status,
    consultationId,
    onSync,
}) {
    const syncRef = useRef(onSync);

    useEffect(() => {
        syncRef.current = onSync;
    }, [onSync]);

    useEffect(() => {
        let websocket = null;
        let reconnectTimerId = null;
        let fallbackTimerId = null;
        let reconnectAttempt = 0;
        let isDisposed = false;

        const wsUrl = buildSocketUrl(
            import.meta.env.VITE_CONSULTATION_WS_URL || "",
            {
                role,
                status,
                consultation_id: consultationId,
            },
        );

        const triggerSync = (silent = true) => {
            if (typeof syncRef.current === "function") {
                syncRef.current(silent);
            }
        };

        const clearFallbackPolling = () => {
            if (fallbackTimerId) {
                clearInterval(fallbackTimerId);
                fallbackTimerId = null;
            }
        };

        const startFallbackPolling = () => {
            if (fallbackTimerId || isDisposed) {
                return;
            }

            fallbackTimerId = setInterval(() => {
                if (document.visibilityState === "visible") {
                    triggerSync(true);
                }
            }, FALLBACK_POLL_INTERVAL);
        };

        const closeSocket = () => {
            if (
                websocket &&
                (websocket.readyState === WebSocket.OPEN ||
                    websocket.readyState === WebSocket.CONNECTING)
            ) {
                websocket.close();
            }
            websocket = null;
        };

        const connect = () => {
            if (!wsUrl || isDisposed) {
                startFallbackPolling();
                return;
            }

            closeSocket();

            try {
                websocket = new WebSocket(wsUrl);
            } catch {
                startFallbackPolling();
                return;
            }

            websocket.onopen = () => {
                reconnectAttempt = 0;
                clearFallbackPolling();
            };

            websocket.onmessage = (event) => {
                let payload = null;
                try {
                    payload = JSON.parse(event.data);
                } catch {
                    payload = null;
                }

                if (shouldSyncByMessage(payload, consultationId)) {
                    triggerSync(true);
                }
            };

            websocket.onerror = () => {
                startFallbackPolling();
            };

            websocket.onclose = () => {
                if (isDisposed) {
                    return;
                }

                startFallbackPolling();
                const delay = Math.min(
                    1000 * 2 ** reconnectAttempt,
                    MAX_RECONNECT_DELAY,
                );
                reconnectAttempt += 1;

                reconnectTimerId = setTimeout(() => {
                    if (
                        !isDisposed &&
                        document.visibilityState === "visible" &&
                        navigator.onLine
                    ) {
                        connect();
                    }
                }, delay);
            };
        };

        const handleFocus = () => {
            triggerSync(true);
        };

        const handleVisible = () => {
            if (document.visibilityState === "visible") {
                triggerSync(true);
                if (
                    wsUrl &&
                    (!websocket || websocket.readyState === WebSocket.CLOSED)
                ) {
                    connect();
                }
            }
        };

        const handleOnline = () => {
            triggerSync(true);
            connect();
        };

        connect();
        window.addEventListener("focus", handleFocus);
        window.addEventListener("online", handleOnline);
        document.addEventListener("visibilitychange", handleVisible);

        return () => {
            isDisposed = true;
            clearFallbackPolling();
            closeSocket();
            if (reconnectTimerId) {
                clearTimeout(reconnectTimerId);
            }
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("online", handleOnline);
            document.removeEventListener("visibilitychange", handleVisible);
        };
    }, [role, status, consultationId]);
}
