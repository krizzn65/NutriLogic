import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logoutWithApi } from '../../lib/auth';
import {
    getSessionTimeout,
    getLastActivity,
    updateLastActivity,
    initActivityTracking
} from '../../lib/sessionTimeout';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

// Session monitor component - checks for inactivity and logs out user
export default function SessionMonitor({ children }) {
    const navigate = useNavigate();
    const checkIntervalRef = useRef(null);
    const user = getUser();
    const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

    useEffect(() => {
        // Skip if not authenticated
        if (!user) return;

        // Initialize activity tracking (mouse, keyboard, etc)
        const cleanupActivity = initActivityTracking();

        // Check session expiry every minute
        const checkSession = () => {
            const lastActivity = getLastActivity();
            const timeout = getSessionTimeout();
            const now = Date.now();
            const elapsedMinutes = (now - lastActivity) / (1000 * 60);

            // If session expired due to inactivity
            if (elapsedMinutes >= timeout) {
                // Log out first to clear session
                logoutWithApi().then(() => {
                    setIsTimeoutModalOpen(true);
                }).catch(() => {
                    setIsTimeoutModalOpen(true);
                });
            }
        };

        // Check every 30 seconds
        checkIntervalRef.current = setInterval(checkSession, 30 * 1000);

        // Cleanup
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            cleanupActivity();
        };
    }, [navigate, user]);

    const handleConfirm = () => {
        setIsTimeoutModalOpen(false);
        navigate('/auth');
    };

    return (
        <>
            {children}

            <Dialog open={isTimeoutModalOpen} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[425px] rounded-[30px] p-6 bg-white" hideClose={true}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 text-center">Sesi Berakhir</DialogTitle>
                        <DialogDescription className="text-gray-500 mt-2 text-center">
                            Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali untuk melanjutkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex justify-center sm:justify-center">
                        <Button
                            onClick={handleConfirm}
                            className="w-full sm:w-auto min-w-[120px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Oke
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
