
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, GraduationCap, UserPlus, Ticket, CheckCircle, BadgeCheck, LogOut, Loader2 } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

const allMenuItems = [
    { href: "/", label: "Dashboard", icon: Home, roles: ["admin"] },
    { href: "/registrations", label: "Registrations", icon: GraduationCap, roles: ["admin"] },
    { href: "/confirmations", label: "Confirmations", icon: BadgeCheck, roles: ["admin"] },
    { href: "/validate-payment", label: "Validate Payment", icon: CheckCircle, roles: ["admin"] },
    { href: "/spot-registration", label: "Spot Registration", icon: UserPlus, roles: ["admin", "spot"] },
    { href: "/issue-band", label: "Issue Band", icon: Ticket, roles: ["admin", "entry"] },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { role, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  if (!role) return null; // Don't render sidebar on login page or if not authenticated

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <>
      <SidebarHeader className="hidden md:flex">
        <div className="flex items-center gap-2 p-2">
            <div className="flex flex-col">
                <h2 className="text-lg font-bold tracking-tight text-sidebar-primary">INSPIRE X</h2>
                <p className="text-sm text-muted-foreground capitalize">{role} Dashboard</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                onClick={() => setOpenMobile(false)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOut />
                <span>Logout</span>
            </Button>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
