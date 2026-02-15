"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lightbulb, LayoutDashboard, User, Bot, Database, BarChartHorizontalBig, NotebookText, LogOut, LogIn } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

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
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", public: true },
  { href: "/explorer", icon: BarChartHorizontalBig, label: "Explorador", public: true },
  { href: "/simulator", icon: Lightbulb, label: "Simulador", public: true },
  { href: "/scenarios", icon: NotebookText, label: "Cenários", public: false },
  { href: "/profile", icon: User, label: "Perfil", public: false },
  { href: "/seed", icon: Database, label: "Seed Data", public: false, adminOnly: true },
];

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

// Extracted component to access useSidebar context
function AppSidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useUser();
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  const navItems = allNavItems.filter(item => {
    if (item.public) return true;
    if (!user) return false; // Hide private items if not logged in
    if (item.adminOnly) return isAdmin; // Show admin items only to admin
    if (item.href === '/profile') return true; // Show profile to any logged in user
    return true; // Show other private items to logged in users
  });

  // Specifically hide scenarios if not logged in
   const finalNavItems = allNavItems.filter(item => {
    if (item.href === '/scenarios' && !user) return false;
    if (item.href === '/profile' && !user) return false;
    if (item.href === '/seed' && !isAdmin) return false;
    return true;
  });


  return (
    <SidebarContent className="p-2">
      <SidebarMenu>
        {finalNavItems.map((item) => (
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
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DP';

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
            <div />
            {user ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button
                          variant="ghost"
                          className="relative h-10 w-10 rounded-full"
                      >
                          <Avatar className="h-10 w-10 border">
                              <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "Avatar"} />
                              <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <p className="font-medium truncate">{user?.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sessão
                </Link>
              </Button>
            )}
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
