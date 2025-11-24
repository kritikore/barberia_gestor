import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from '@/styles/Sidebar.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const handleToggle = (expanded: boolean) => {
        setIsSidebarExpanded(expanded);
    };

    const mainClasses = `${styles.contentShift} ${isSidebarExpanded ? styles.isExpanded : ''}`;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-background)' }}>
            <Sidebar
                currentModule="Dashboard"
                onToggle={handleToggle}
                isExpanded={isSidebarExpanded}
            />
            <main
                className={mainClasses}
                style={{
                    flexGrow: 1,
                    padding: '30px',
                    marginLeft: isSidebarExpanded ? '280px' : '80px', // ✅ sincronizado con el sidebar
                    transition: 'margin-left 0.3s ease-in-out',
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
