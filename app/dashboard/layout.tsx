"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Home,
  Plus,
  FileText,
  BarChart,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/contexts/language-context";
import { useModal } from "@/contexts/modal-context";
import { PricingModal } from "@/components/pricing-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { TOKEN_KEYS, logout } from "@/lib/auth";
import { api, API_ENDPOINTS } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const { isPricingModalOpen, setIsPricingModalOpen } = useModal();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Update the useEffect to use axios
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Try to get user from localStorage first
        const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);

        if (userData) {
          setUser(JSON.parse(userData));
          setLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        try {
          const response = await api.get(API_ENDPOINTS.AUTH.WHOAMI);
          const data = response.data;
          localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(data));
          setUser(data);
        } catch (error) {
          console.error("Error fetching user:", error);
          // Redirect to login if we can't fetch user data
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Redirect to login if we can't fetch user data
        router.push("/auth/signin");
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    fetchUser();
  }, [router]);

  // Add another useEffect to check if user is null after loading is complete
  useEffect(() => {
    if (!loading && mounted && !user) {
      router.push("/auth/signin");
    }
  }, [loading, mounted, user, router]);

  // Add keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+B (macOS) or Ctrl+B (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault(); // Prevent browser's default behavior

        // Get the sidebar context and toggle it
        const sidebarContext = document.querySelector(
          '[data-sidebar="sidebar"]'
        );
        if (sidebarContext) {
          const sidebarTrigger = document.querySelector(
            '[data-sidebar="trigger"]'
          ) as HTMLButtonElement;
          if (sidebarTrigger) {
            sidebarTrigger.click();
          }
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="flex items-center justify-center p-4">
            <a href="/">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Brain className="h-7 w-7 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden">
                  TestGenius AI
                </span>
              </div>
            </a>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  tooltip={t("nav.dashboard")}
                  className="text-base py-3 align-center"
                >
                  <a href="/dashboard">
                    <Home className="h-5 w-5" />
                    <span>{t("nav.dashboard")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/create"}
                  tooltip={t("nav.create")}
                  className="text-base py-3"
                >
                  <a href="/dashboard/create">
                    <Plus className="h-5 w-5" />
                    <span>{t("nav.create")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/saved"}
                  tooltip={t("nav.saved")}
                  className="text-base py-3"
                >
                  <a href="/dashboard/saved">
                    <FileText className="h-5 w-5" />
                    <span>{t("nav.saved")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/analytics"}
                  tooltip={t("nav.analytics")}
                  className="text-base py-3"
                >
                  <a href="/dashboard/analytics">
                    <BarChart className="h-5 w-5" />
                    <span>{t("nav.analytics")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === "/dashboard/settings" ||
                    pathname.startsWith("/dashboard/settings/")
                  }
                  tooltip={t("nav.settings")}
                  className="text-base py-3"
                >
                  <a href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>{t("nav.settings")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/profile"}
                  tooltip={t("nav.profile")}
                  className="text-base py-3"
                >
                  <a href="/dashboard/profile">
                    <User className="h-5 w-5" />
                    <span>{t("nav.profile")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 w-full justify-start group-data-[collapsible=icon]:justify-center"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.logo} alt="User" />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || "U"}
                        {user?.lastName?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium">
                        {user?.firstName || "User"} {user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Free Plan
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href="/dashboard/profile"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="/dashboard/settings"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("nav.settings")}</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col w-full">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6 lg:px-8">
              <SidebarTrigger />
              <div className="ml-auto flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggle />
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* Replace the coin display section with this improved version: */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium text-sm transition-colors hover:bg-amber-200 dark:hover:bg-amber-950/60">
                        <Image
                          src="/coin-small.png"
                          alt="Coin"
                          width={23}
                          height={23}
                        />
                        <span>{user?.coins || 0}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Available coins for generating tests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* <Button
                  variant='default'
                  size='sm'
                  className='px-4'
                  onClick={() => setIsPricingModalOpen(true)}
                >
                  {t('common.upgrade')}
                </Button> */}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
            <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
          </main>
        </SidebarInset>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
      />
    </SidebarProvider>
  );
}
