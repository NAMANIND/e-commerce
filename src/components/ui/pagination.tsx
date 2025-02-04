"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  function getPageUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(
    (page) =>
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
  );

  let lastShownPage: number | null = null;

  return (
    <nav className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage === 1}
      >
        <Link href={getPageUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {showPages.map((page) => {
        const needsEllipsis = lastShownPage && page - lastShownPage > 1;
        lastShownPage = page;

        return (
          <div key={page} className="flex items-center">
            {needsEllipsis && <span className="px-2 text-gray-500">...</span>}
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              asChild
            >
              <Link href={getPageUrl(page)}>{page}</Link>
            </Button>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage === totalPages}
      >
        <Link href={getPageUrl(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
