import React, { createContext, useContext, useState } from 'react';
import ProfileModal from '../components/dashboard/ProfileModal';

const ProfileModalContext = createContext();

export const useProfileModal = () => {
    const context = useContext(ProfileModalContext);
    if (!context) {
        throw new Error('useProfileModal must be used within a ProfileModalProvider');
    }
    return context;
};

export const ProfileModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

    const openProfileModal = () => setIsOpen(true);
    const closeProfileModal = () => setIsOpen(false);
    const notifyProfileUpdate = () => setProfileUpdateTrigger(prev => prev + 1);

    return (
        <ProfileModalContext.Provider value={{
            isOpen,
            openProfileModal,
            closeProfileModal,
            profileUpdateTrigger,
            notifyProfileUpdate
        }}>
            {children}
            <ProfileModal isOpen={isOpen} onClose={closeProfileModal} />
        </ProfileModalContext.Provider>
    );
};
