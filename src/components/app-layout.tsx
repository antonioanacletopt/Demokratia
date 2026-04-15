"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lightbulb, User, BarChartHorizontalBig, LogOut, LogIn, ShieldCheck, Wrench, Home, Scale, MessageSquare, Mail, FileText, Languages, Check, Zap, Wallet, Info, HelpCircle, BookOpen, Map as MapIcon, Calculator, TrendingUp, Library, Landmark, Users, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useAuth, useUser, useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useTranslation, type Language } from "@/lib/i18n";
import { useEffect, useState } from "react";

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
import { Breadcrumbs } from "@/components/Breadcrumbs";

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

function AppSidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useUser();
  const { t } = useTranslation();
  const isAdmin = user && (user.email === ADMIN_EMAIL || user.uid === 'id5hDeMIVZeR9i9HG5vvqnjEto32');

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const allNavItems = [
    { href: "/home", icon: Home, label: t('nav.home'), public: true },
    { href: "/explorer", icon: BarChartHorizontalBig, label: t('nav.explorer'), public: true },
    { href: "/map", icon: MapIcon, label: t('nav.map'), public: true },
    { href: "/irs", icon: Calculator, label: t('nav.irs'), public: true },
    { href: "/budget", icon: Wallet, label: t('nav.budget'), public: true },
    { href: "/inflation", icon: ShoppingCart, label: t('nav.inflation'), public: true },
    { href: "/investor", icon: TrendingUp, label: t('nav.investor'), public: true },
    { href: "/simulations", icon: Lightbulb, label: t('nav.simulations'), public: true },
    { href: "/scenarios", icon: Zap, label: t('nav.scenarios'), public: true },
    { href: "/fact-check", icon: ShieldCheck, label: t('nav.factCheck'), public: true },
    { href: "/legislation", icon: Scale, label: t('nav.legislation'), public: true },
    { href: "/proposals", icon: MessageSquare, label: t('nav.proposals'), public: true },
    { href: "/library", icon: Library, label: t('nav.library'), public: true },
    { id: 'partidos', icon: Users, label: t('nav.partidos'), href: '/partidos' },
    { id: 'instituicoes', icon: Landmark, label: t('nav.instituicoes'), href: '/instituicoes' },
    { href: "/methodology", icon: BookOpen, label: t('nav.methodology'), public: true },
    { href: "/about", icon: Info, label: t('nav.about'), public: true },
    { href: "/faq", icon: HelpCircle, label: t('nav.faq'), public: true },
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
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { t, setLanguage, language } = useTranslation();
  
  const [hasSyncedProfile, setHasSyncedProfile] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: profileData, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!firestore) return;
    const sessionKey = 'demokratia-session-logged';
    const isLoggedThisSession = sessionStorage.getItem(sessionKey);
    if (!isLoggedThisSession) {
      const sessionsRef = collection(firestore, 'analytics_sessions');
      addDocumentNonBlocking(sessionsRef, {
        timestamp: serverTimestamp(),
        isAnonymous: !user,
        userId: user?.uid || null,
        path: window.location.pathname
      });
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [firestore, user]);

  useEffect(() => {
    if (user && !isProfileLoading && !profileData && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        id: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferredLanguage: 'pt'
      }, { merge: true });
    }
  }, [user, profileData, isProfileLoading, firestore]);

  useEffect(() => {
    if (profileData?.preferredLanguage && !hasSyncedProfile) {
      setLanguage(profileData.preferredLanguage as Language);
      setHasSyncedProfile(true);
    }
  }, [profileData, setLanguage, hasSyncedProfile]);

  useEffect(() => {
    if (!user) setHasSyncedProfile(false);
  }, [user]);

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
            <div className="flex h-10 w-10 items-center justify-center"><Logo className="size-8" /></div>
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
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Languages className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('nav.language')}</DropdownMenuLabel>
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
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border border-primary/20">
                                <AvatarImage src={user?.photoURL ?? undefined} />
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
                        <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" /><span>{t('nav.profile')}</span></Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>{t('nav.logout')}</span></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              ) : <Button asChild variant="outline"><Link href="/login">{t('nav.login')}</Link></Button>}
            </div>
        </header>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 sm:p-6">
            <Breadcrumbs />
            {children}
          </div>
          <footer className="border-t py-12 px-4 sm:px-6 bg-muted/30">
            <div className="flex flex-col gap-10 max-w-7xl mx-auto">
              <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Logo className="size-6" />
                    <span className="text-lg font-bold font-headline text-primary">Demokratia</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('footer.desc')}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">{t('footer.resources')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/explorer" className="hover:text-primary">{t('nav.explorer')}</Link></li>
                    <li><Link href="/map" className="hover:text-primary">{t('nav.map')}</Link></li>
                    <li><Link href="/simulations" className="hover:text-primary">{t('nav.simulations')}</Link></li>
                    <li><Link href="/methodology" className="hover:text-primary">{t('nav.methodology')}</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">{t('footer.company')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/about" className="hover:text-primary">{t('nav.about')}</Link></li>
                    <li><Link href="/faq" className="hover:text-primary">{t('nav.faq')}</Link></li>
                    <li><Link href="/contact" className="hover:text-primary">{t('nav.contact')}</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">{t('footer.legal')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/terms" className="hover:text-primary">{t('nav.terms')}</Link></li>
                    <li><Link href="/privacy" className="hover:text-primary">{t('nav.privacy')}</Link></li>
                    <li><Link href="/cookies" className="hover:text-primary">{t('nav.cookies')}</Link></li>
                    <li>
                      <button
                        onClick={() => { localStorage.removeItem('cookie-consent-v2'); window.dispatchEvent(new Event('openCookieConsent')); }}
                        className="hover:text-primary text-left text-muted-foreground"
                      >
                        {t('cookies.managePreferences')}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center sm:text-right leading-relaxed max-w-lg">
                  {t('footer.disclaimer')}
                </p>
              </div>
            </div>
          </footer>
        </div>
        <CookieConsent />
      </SidebarInset>
    </SidebarProvider>
  );
}
