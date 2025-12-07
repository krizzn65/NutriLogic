import React from 'react';
import ChildProfileCard from './ChildProfileCard';
import { Calendar } from '../ui/calendar';
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
import { useNavigate } from 'react-router-dom';
import { logoutWithApi } from '../../lib/auth';
import { useProfileModal } from '../../contexts/ProfileModalContext';
import { useSettingsModal } from '../../contexts/SettingsModalContext';

export default function RightSection({ user, childrenData, schedules, selectedChildId, onSelectChild }) {
    const navigate = useNavigate();
    const { openProfileModal } = useProfileModal();
    const { openSettingsModal } = useSettingsModal();

    // Get the display child (selected or featured)
    const displayChild = selectedChildId
        ? childrenData?.find(c => c.id === selectedChildId)
        : (childrenData?.find(c => c.latest_nutritional_status?.is_at_risk) || childrenData?.[0]);

    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await logoutWithApi();
        navigate("/auth");
    };

    return (
        <div className="flex flex-col gap-10">


            <div className="shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Kartu Anak</h3>

                    {/* Child Selector Dropdown */}
                    {childrenData && childrenData.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm">
                                    <Icon icon="lucide:users" className="text-gray-500 w-4 h-4" />
                                    <span>{displayChild?.full_name || "Pilih Anak"}</span>
                                    <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                                {childrenData.map((child) => (
                                    <DropdownMenuItem
                                        key={child.id}
                                        onClick={() => onSelectChild && onSelectChild(child.id)}
                                        className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                                            {child.full_name.charAt(0)}
                                        </div>
                                        <span>{child.full_name}</span>
                                        {child.id === (selectedChildId || displayChild?.id) && (
                                            <Icon icon="lucide:check" className="ml-auto text-blue-600 w-4 h-4" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {displayChild ? (
                    <ChildProfileCard child={displayChild} />
                ) : (
                    <div className="bg-blue-50 rounded-[30px] p-8 text-center border border-blue-100 border-dashed">
                        <p className="text-blue-600 font-medium">Belum ada data anak</p>
                    </div>
                )}
            </div>

            {/* Calendar with Schedule Integration */}
            <div>
                <Calendar />
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
