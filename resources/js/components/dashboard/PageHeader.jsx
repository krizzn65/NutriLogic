import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { logoutWithApi, getUser } from '../../lib/auth';
import { useProfileModal } from '../../contexts/ProfileModalContext';
import { useSettingsModal } from '../../contexts/SettingsModalContext';

export default function PageHeader({ title, subtitle = "Portal Orang Tua", children, showProfile = true, profileClassName = "" }) {
    const navigate = useNavigate();
    const { openProfileModal, profileUpdateTrigger } = useProfileModal();
    const { openSettingsModal } = useSettingsModal();
    const [user, setUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const userData = getUser();
        setUser(userData);
    }, [profileUpdateTrigger]); // Re-fetch when profile updates

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await logoutWithApi();
        navigate("/auth");
    };

    return (
        <div className="flex flex-col gap-3 mb-6 mt-6 pl-2 md:mt-0 md:pl-0 md:mb-8">
            <div className="flex flex-row items-center justify-between gap-4">
                {/* Title & Subtitle with improved typography hierarchy */}
                <div className="space-y-1">
                    <p className="text-sm md:text-xs font-medium text-gray-500 uppercase tracking-wide">{subtitle}</p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h1>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-4">
                    {/* Action Buttons (Children) */}
                    {children}

                    {/* Profile Dropdown */}
                    {/* Profile Dropdown */}
                    {showProfile && (
                        <div className={profileClassName}>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer">
                                    <div className="text-right block">
                                        <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Orang Tua'}</p>
                                    </div>
                                    <div className="w-12 h-12 md:w-12 md:h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img
                                            src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer" onClick={openProfileModal}>
                                        <Icon icon="lucide:user" className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={openSettingsModal}>
                                        <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
                                        <span>Setting</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogoutClick}>
                                        <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <DialogContent className="sm:max-w-[425px] rounded-[30px] p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Konfirmasi Logout</DialogTitle>
                        <DialogDescription className="text-gray-500 mt-2">
                            Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk mengakses akun Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={confirmLogout}
                            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                        >
                            Ya, Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
