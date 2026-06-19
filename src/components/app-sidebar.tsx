"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileUser, UserRound } from "lucide-react";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Ofertas", icon: LayoutGrid },
  { href: "/app/cv", label: "Mi CV", icon: FileUser },
  { href: "/app/perfil", label: "Mi perfil", icon: UserRound },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="px-5 py-5">
        <Link href="/app">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-5 py-4 text-xs text-muted-foreground">
        Es Sencillo · Chile
      </p>
    </aside>
  );
}
