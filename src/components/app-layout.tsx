"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lightbulb, LayoutDashboard, User, Database, BarChartHorizontalBig, NotebookText, LogOut, LogIn, ShieldCheck, Wrench, Home, Scale } from "lucide-react";
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
import { Logo } from "@/components/Logo";

const allNavItems = [
  { href: "/home", icon: Home, label: "Início", public: true },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", public: true },
  { href: "/explorer", icon: BarChartHorizontalBig, label: "Explorador", public: true },
  { href: "/simulator", icon: Lightbulb, label: "Simulador", public: true },
  { href: "/fact-check", icon: ShieldCheck, label: "Fact Check", public: true },
  { href: "/legislation", icon: Scale, label: "Legislação", public: true },
  { href: "/scenarios", icon: NotebookText, label: "Cenários", public: true },
  { href: "/profile", icon: User, label: "Perfil", public: false },
  { href: "/admin", icon: Wrench, label: "Admin", public: false, adminOnly: true },
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

  const finalNavItems = allNavItems.filter(item => {
    if (item.public) return true; // Public items are always visible
    if (!user) return false; // Private items require a user
    if (item.adminOnly && !isAdmin) return false; // Admin items require admin role
    return true; // Other private items are visible to logged-in users
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
    router.push('/home');
  };

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DP';

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="size-8" />
            </div>
            <h1 className="text-xl font-semibold font-headline">Demokratia</h1>
          </div>
        </SidebarHeader>
        <AppSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
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
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
