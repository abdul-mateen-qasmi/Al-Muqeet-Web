import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

interface PillNavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface PillNavProps {
  items: PillNavItem[];
  isMobile?: boolean;
}

export function PillNav({ items, isMobile = false }: PillNavProps) {
  if (isMobile) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-md rounded-full px-4 py-2 border border-border shadow-2xl z-50 flex items-center gap-1 w-auto max-w-[90vw] justify-between overflow-x-auto pb-safe">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center justify-center w-12 h-12 rounded-full text-text-muted transition-colors",
                isActive && "text-accent-limeText z-10"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-accent-lime rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-full p-1 border border-border flex items-center gap-1">
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "relative px-5 py-2 text-[13px] font-medium transition-colors rounded-full",
              isActive ? "text-accent-limeText" : "text-text-muted hover:text-text-primary"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-accent-lime rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
