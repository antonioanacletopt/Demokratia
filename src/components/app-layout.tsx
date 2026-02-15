"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, LayoutDashboard, User, Bot, Database, BarChartHorizontalBig, NotebookText } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from "@/firebase";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/explorer", icon: BarChartHorizontalBig, label: "Explorador" },
  { href: "/simulator", icon: Lightbulb, label: "Simulador" },
  { href: "/scenarios", icon: NotebookText, label: "Cenários" },
  { href: "/seed", icon: Database, label: "Seed Data", adminOnly: true },
];

const ADMIN_EMAIL = "user@demokratia.pt";

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

// Extracted component to access useSidebar context
function AppSidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useUser();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItems = allNavItems.filter(item => {
    if (!item.adminOnly) return true;
    return user?.email === ADMIN_EMAIL;
  });

  return (
    <SidebarContent className="p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={{ children: item.label, side: 'right' }}
              onClick={handleLinkClick}
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
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline text-primary-dark">Demokratia</h1>
          </div>
        </SidebarHeader>
        <AppSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                    >
                        <Avatar className="h-10 w-10 border">
                            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Avatar" data-ai-hint={userAvatar.imageHint} />}
                            <AvatarFallback>DP</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
