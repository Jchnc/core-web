'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BreadcrumbNode {
  label: string;
  href?: string;
}

export interface AppBreadcrumbsProps {
  /**
   * Optional custom items. If not provided, it will automatically
   * generate the breadcrumbs based on the current pathname.
   */
  items?: BreadcrumbNode[];
}

export function AppBreadcrumbs({ items }: AppBreadcrumbsProps): React.JSX.Element | null {
  const pathname = usePathname();

  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    // Default dynamic generation
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [{ label: 'Home', href: '/dashboard' }];
    }

    const generated: BreadcrumbNode[] = [];

    // Optional: Prepend a home/dashboard link for deeper routes if you like
    if (segments[0] !== 'dashboard') {
      generated.push({ label: 'Dashboard', href: '/dashboard' });
    }

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      generated.push({ label, href });
    });

    return generated;
  }, [items, pathname]);

  if (!breadcrumbItems.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ?
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                : <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                }
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
