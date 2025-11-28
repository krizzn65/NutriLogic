import React, { createContext, useContext, useState } from 'react';
import SettingsModal from '../components/dashboard/SettingsModal';

const SettingsModalContext = createContext();

export const useSettingsModal = () => {
    const context = useContext(SettingsModalContext);
    if (!context) {
        throw new Error('useSettingsModal must be used within a SettingsModalProvider');
    }
    return context;
};

export const SettingsModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openSettingsModal = () => setIsOpen(true);
    const closeSettingsModal = () => setIsOpen(false);

    return (
        <SettingsModalContext.Provider value={{ isOpen, openSettingsModal, closeSettingsModal }}>
            {children}
            <SettingsModal isOpen={isOpen} onClose={closeSettingsModal} />
        </SettingsModalContext.Provider>
    );
};
