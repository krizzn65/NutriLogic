import React from 'react';
import HeroCard from './HeroCard';
import UnifiedStatsGroup from './UnifiedStatsGroup';


export default function MainSection({ user, summary }) {
    return (
        <div className="flex flex-col gap-2 md:gap-8">
            <HeroCard userName={user?.name || 'Parents'} />

            <UnifiedStatsGroup summary={summary} />

        </div>
    );
}
