import React from 'react';
import HeroCard from './HeroCard';
import UnifiedStatsGroup from './UnifiedStatsGroup';
import PageHeader from './PageHeader';

export default function MainSection({ user, summary }) {
    return (
        <div className="flex flex-col gap-2 md:gap-8">
            {/* Header */}
            <PageHeader title="Overview" subtitle="Portal Orang Tua" profileClassName="block xl:hidden" />

            <HeroCard userName={user?.name || 'Parents'} />

            <UnifiedStatsGroup summary={summary} />

        </div>
    );
}
