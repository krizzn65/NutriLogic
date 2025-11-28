import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ChildProfileCard from '../dashboard/ChildProfileCard';
import ChildCardModal from '../dashboard/ChildCardModal';

export function DataAnakTable({ data, onAdd }) {
    const navigate = useNavigate();
    const [selectedChild, setSelectedChild] = useState(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    const handleShowCard = (child) => {
        setSelectedChild(child);
        setIsCardModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.map((child) => (
                    <ChildProfileCard
                        key={child.id}
                        child={child}
                        onClick={() => navigate(`/dashboard/anak/${child.id}`)}
                        onShowCard={handleShowCard}
                    />
                ))}

                {/* Add Child Card */}
                <button
                    onClick={onAdd}
                    className="group relative flex flex-col items-center justify-center min-h-[200px] rounded-[24px] border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30 transition-all duration-300 ease-out"
                >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Tambah Anak</h3>
                    <p className="text-sm text-gray-400 mt-1">Daftarkan buah hati baru</p>
                </button>
            </div>

            <ChildCardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                child={selectedChild}
            />
        </div>
    );
}
