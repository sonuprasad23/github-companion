import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
    return (
        <div
            className={`
        glass-card p-6 relative overflow-hidden group
        ${hoverEffect ? 'hover:border-primary/30 transition-all duration-300 hover:shadow-primary/10' : ''}
        ${className}
      `}
        >
            {hoverEffect && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
