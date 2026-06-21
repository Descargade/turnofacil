"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Scissors,
  Users,
  UserCircle,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/types";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  user?: {
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Calendario", href: "/calendario", icon: Calendar },
  { title: "Turnos", href: "/turnos", icon: CalendarCheck },
  { title: "Servicios", href: "/servicios", icon: Scissors },
  { title: "Equipo", href: "/equipo", icon: Users },
  { title: "Clientes", href: "/clientes", icon: UserCircle },
  { title: "Configuración", href: "/configuracion", icon: Settings },
];

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  BUSINESS_ADMIN: "Administrador",
  CUSTOMER: "Cliente",
};

export function Sidebar({ collapsed = false, onToggle, user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = [
    ...navItems,
    ...(user?.role === "BUSINESS_ADMIN"
      ? [{ title: "Suscripción", href: "/suscripcion", icon: CreditCard }]
      : []),
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-surface-200/60 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-surface-200/60 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/25">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">
              <span className="text-brand-600">Turno</span>
              <span className="text-accent-600">Fácil</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/25">
            <Calendar className="h-4 w-4 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden h-8 w-8 shrink-0 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive
                    ? "text-brand-600"
                    : "text-surface-400 group-hover:text-surface-600"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-3 w-auto" />

      {/* User Info */}
      <div className="p-3">
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 ring-2 ring-brand-100">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-surface-800">
                  {user.name}
                </p>
                <p className="truncate text-xs text-surface-400">
                  {roleLabels[user.role]}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "mt-2 w-full justify-start gap-3 text-surface-400 hover:text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-0"
          )}
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
