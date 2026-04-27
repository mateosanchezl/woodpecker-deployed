"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAppBootstrap } from "@/hooks/use-app-bootstrap";
import {
  getAppHeaderBreadcrumbs,
  getResumeTrainingHref,
  getResumeTrainingSet,
  shouldShowResumeTraining,
} from "@/lib/app-header";

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const breadcrumbs = getAppHeaderBreadcrumbs(pathname);
  const { data: sets } = useAppBootstrap({
    select: (bootstrap) => bootstrap.sets,
  });
  const resumeSet = getResumeTrainingSet(sets);
  const showResumeTraining = shouldShowResumeTraining({
    pathname,
    searchParams,
    resumeSet,
  });

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <Breadcrumb className="min-w-0 overflow-hidden">
        <BreadcrumbList className="flex-nowrap overflow-hidden">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={`${breadcrumb.label}:${index}`}>
                <BreadcrumbItem className="min-w-0">
                  {isLast ? (
                    <BreadcrumbPage className="truncate">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="truncate">
                      <Link href={breadcrumb.href ?? "/dashboard"}>
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {showResumeTraining && resumeSet && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 max-w-[10.5rem] shrink-0 gap-1.5 px-2.5 sm:max-w-64"
          data-testid="app-header-resume-training"
          aria-label={`Continue training ${resumeSet.name}`}
        >
          <Link href={getResumeTrainingHref(resumeSet)}>
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Continue</span>
            <span className="hidden min-w-0 truncate text-muted-foreground sm:inline">
              {resumeSet.name}
            </span>
          </Link>
        </Button>
      )}
    </div>
  );
}
