
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Club, Ticket, CheckCircle, GraduationCap, BadgeCheck, UserPlus } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const menuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/registrations", label: "Registrations", icon: GraduationCap },
    { href: "/spot-registration", label: "Spot Registration", icon: UserPlus },
    { href: "/issue-band", label: "Issue Band", icon: Ticket },
    { href: "/validate-payment", label: "Validate Payment", icon: CheckCircle },
    { href: "/confirmations", label: "Confirmations", icon: BadgeCheck },
  ];

  return (
    <>
      <SidebarHeader className="hidden md:flex">
        <div className="flex items-center gap-2 p-2">
            <Club className="h-8 w-8 text-sidebar-primary" />
            <div className="flex flex-col">
                <h2 className="text-lg font-bold tracking-tight text-sidebar-primary">INSPIRE X</h2>
                <p className="text-sm text-muted-foreground">by Connect Club</p>
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
    </>
  );
};

export default AppSidebar;
