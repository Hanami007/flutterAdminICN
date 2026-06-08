import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  GraduationCap,
  CalendarCheck,
  CalendarDays,
  Building2,
  Video,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  GraduationCap as Logo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { type: 'separator' as const, label: 'Management' },
  { label: 'Courses', icon: BookOpen, path: '/courses' },
  { label: 'Categories', icon: FolderTree, path: '/categories' },
  { label: 'Teachers', icon: Users, path: '/teachers' },
  { label: 'Students', icon: GraduationCap, path: '/students' },
  { type: 'separator' as const, label: 'Operations' },
  { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
  { label: 'Class Sessions', icon: CalendarDays, path: '/sessions' },
  { label: 'Branches', icon: Building2, path: '/branches' },
  { label: 'Videos', icon: Video, path: '/videos' },
  { type: 'separator' as const, label: 'Finance & Reports' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { type: 'separator' as const, label: 'System' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300 flex flex-col',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Logo className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight whitespace-nowrap animate-fade-in">
              Learn<span className="text-primary">Hub</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {menuItems.map((item, index) => {
            if ('type' in item && item.type === 'separator') {
              return collapsed ? (
                <Separator key={index} className="my-2" />
              ) : (
                <div key={index} className="px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {item.label}
                  </p>
                </div>
              );
            }

            if (!('path' in item) || !item.icon) return null;

            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            const link = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('w-full justify-center', !collapsed && 'justify-start')}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
