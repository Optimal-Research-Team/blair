"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/data/mock-staff";

const pathLabels: Record<string, string> = {
  inbox: "Fax Inbox",
  worklist: "Worklist",
  fax: "Fax Detail",
  split: "Document Splitting",
  referrals: "Referrals",
  communications: "Communications",
  dashboard: "Dashboard",
  settings: "Settings",
  "document-types": "Document Types",
  sla: "SLA Rules",
  integrations: "Integrations",
  "auto-file": "Auto-File",
  "fax-lines": "Fax Lines",
};

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            // Skip dynamic segments like [id]
            if (segment.startsWith("[") || /^[a-f0-9-]{36}$/.test(segment) || /^(fax|ref|pat)-/.test(segment)) {
              return null;
            }
            const label = pathLabels[segment] || segment;
            const href = "/" + segments.slice(0, index + 1).join("/");

            return (
              <span key={segment} className="flex items-center gap-1.5">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>All systems operational</span>
        </div>
        <Separator orientation="vertical" className="hidden h-4 sm:block" />
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline-block">
            {currentUser.name}
          </span>
        </div>
      </div>
    </header>
  );
}
