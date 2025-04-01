'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaRunning, 
  FaTrophy, 
  FaUserFriends, 
  FaCog,
  FaChartLine,
  FaStore
} from 'react-icons/fa';

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
  activePattern: RegExp;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: <FaHome className="h-5 w-5" />,
      activePattern: /^\/dashboard/,
    },
    {
      href: '/habits',
      label: 'Habits',
      icon: <FaRunning className="h-5 w-5" />,
      activePattern: /^\/habits/,
    },
    {
      href: '/quests',
      label: 'Quests',
      icon: <FaTrophy className="h-5 w-5" />,
      activePattern: /^\/quests/,
    },
    {
      href: '/analytics',
      label: 'Stats',
      icon: <FaChartLine className="h-5 w-5" />,
      activePattern: /^\/analytics|^\/trackers/,
    },
    {
      href: '/social/friends',
      label: 'Social',
      icon: <FaUserFriends className="h-5 w-5" />,
      activePattern: /^\/social/,
    },
  ];
  
  const isActive = (item: NavItem) => {
    return item.activePattern.test(pathname);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-16">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="container max-w-lg mx-auto">
          <div className="flex justify-between">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 flex-1 ${
                  isActive(item)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            <Link
              href="/settings"
              className={`flex flex-col items-center py-2 flex-1 ${
                pathname === '/settings'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <FaCog className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
} 