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
                {/* Add Child Card */}
            </div>

            <ChildCardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                child={selectedChild}
            />
        </div>
    );
}
