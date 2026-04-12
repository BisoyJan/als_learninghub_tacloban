import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Bell, BookOpen, ClipboardList, Folder, LayoutGrid, Megaphone, MessageSquare, Settings, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, UserRole } from '@/types';
import AppLogo from './app-logo';

function getNavItems(role: UserRole): NavItem[] {
    const common: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    const studentItems: NavItem[] = [
        {
            title: 'My Modules',
            href: '/library',
            icon: BookOpen,
        },
        {
            title: 'My Progress',
            href: '/progress',
            icon: ClipboardList,
        },
        {
            title: 'Announcements',
            href: '/announcements',
            icon: Megaphone,
        },
        {
            title: 'Forum',
            href: '/forum',
            icon: MessageSquare,
        },
    ];

    const teacherItems: NavItem[] = [
        {
            title: 'My Students',
            href: '/gradebook/students',
            icon: Users,
        },
        {
            title: 'Modules',
            href: '/library',
            icon: BookOpen,
        },
        {
            title: 'Progress Tracking',
            href: '/gradebook',
            icon: ClipboardList,
        },
        {
            title: 'Announcements',
            href: '/announcements',
            icon: Megaphone,
        },
        {
            title: 'Forum',
            href: '/forum',
            icon: MessageSquare,
        },
    ];

    const adminItems: NavItem[] = [
        {
            title: 'User Management',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Modules',
            href: '/admin/modules',
            icon: BookOpen,
        },
        {
            title: 'Announcements',
            href: '/announcements-manage',
            icon: Megaphone,
        },
        {
            title: 'Forum',
            href: '/forum',
            icon: MessageSquare,
        },
        {
            title: 'Settings',
            href: '/admin/settings',
            icon: Settings,
        },
        {
            title: 'Reports',
            href: '/admin/reports',
            icon: BarChart3,
        },
    ];

    switch (role) {
        case 'admin':
            return [...common, ...adminItems];
        case 'teacher':
            return [...common, ...teacherItems];
        default:
            return [...common, ...studentItems];
    }
}

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const navItems = getNavItems(auth.user.role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
