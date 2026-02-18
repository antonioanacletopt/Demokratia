
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lightbulb, LayoutDashboard, User, Database, BarChartHorizontalBig, NotebookText, LogOut, LogIn, ShieldCheck, Wrench, Home, Scale, MessageSquare, Mail, Shield, FileText, Languages, Check } from "lucide-react";
import { useAuth, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useTranslation, type Language } from "@/lib/i18n";
import { useEffect } from "react";

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
import { CookieConsent } from "@/components/CookieConsent";

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

function AppSidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useUser();
  const { t } = useTranslation();
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const allNavItems = [
    { href: "/home", icon: Home, label: t('nav.home'), public: true },
    { href: "/dashboard", icon: LayoutDashboard, label: t('nav.dashboard'), public: true },
    { href: "/explorer", icon: BarChartHorizontalBig, label: t('nav.explorer'), public: true },
    { href: "/simulations", icon: Lightbulb, label: t('nav.simulations'), public: true },
    { href: "/fact-check", icon: ShieldCheck, label: t('nav.factCheck'), public: true },
    { href: "/legislation", icon: Scale, label: t('nav.legislation'), public: true },
    { href: "/proposals", icon: MessageSquare, label: t('nav.proposals'), public: true },
    { href: "/contact", icon: Mail, label: t('nav.contact'), public: true },
    { href: "/profile", icon: User, label: t('nav.profile'), public: false },
    { href: "/admin", icon: Wrench, label: t('nav.admin'), public: false, adminOnly: true },
  ];

  const finalNavItems = allNavItems.filter(item => {
    if (item.public) return true;
    if (!user) return false;
    if (item.adminOnly && !isAdmin) return false;
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
  const { user, firestore } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { t, setLanguage, language } = useTranslation();

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProfiles', user.uid) : null),
    [user, firestore]
  );
  const { data: profileData } = useDoc(userProfileRef);

  // Synchronize language with user profile preference if authenticated
  useEffect(() => {
    if (profileData?.preferredLanguage && profileData.preferredLanguage !== language) {
      setLanguage(profileData.preferredLanguage as Language);
    }
  }, [profileData, setLanguage, language]);

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
            <div className="flex h-10 w-10 items-center justify-center">
                <Logo className="size-8" />
            </div>
            <h1 className="text-xl font-semibold font-headline text-primary">Demokratia</h1>
          </div>
        </SidebarHeader>
        <AppSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('common.language')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLanguage('pt')} className="flex items-center justify-between">
                    <span>{t('common.portuguese')}</span>
                    {language === 'pt' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center justify-between">
                    <span>{t('common.english')}</span>
                    {language === 'en' && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-full"
                        >
                            <Avatar className="h-10 w-10 border border-primary/20">
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
                            <span>{t('nav.profile')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>{t('nav.logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('nav.login')}
                  </Link>
                </Button>
              )}
            </div>
        </header>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 sm:p-6">
            {children}
          </div>
          
          <footer className="border-t py-8 px-4 sm:px-6 bg-muted/30">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Logo className="size-4 opacity-50 grayscale" />
                  <span className="font-medium">© {new Date().getFullYear()} Demokratia Portugal</span>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                  <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                    <FileText className="h-3 w-3" />
                    {t('nav.terms')}
                  </Link>
                  <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                    <Shield className="h-3 w-3" />
                    {t('nav.privacy')}
                  </Link>
                  <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                    {t('nav.contact')}
                  </Link>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center sm:text-left leading-relaxed">
                Aviso: A informação gerada por Inteligência Artificial nesta plataforma é meramente indicativa e deve ser validada junto de fontes oficiais. 
                O Demokratia não se responsabiliza por decisões tomadas com base em conteúdo gerado automaticamente.
              </p>
            </div>
          </footer>
        </div>
        <CookieConsent />
      </SidebarInset>
    </SidebarProvider>
  );
}
