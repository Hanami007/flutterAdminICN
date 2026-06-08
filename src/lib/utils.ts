import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    published: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    scheduled: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    in_progress: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-red-500/15 text-red-700 dark:text-red-400',
    rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
    failed: 'bg-red-500/15 text-red-700 dark:text-red-400',
    archived: 'bg-slate-500/15 text-slate-700 dark:text-slate-400',
    expired: 'bg-slate-500/15 text-slate-700 dark:text-slate-400',
    refunded: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    partially_refunded: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  };
  return statusColors[status] || 'bg-slate-500/15 text-slate-700 dark:text-slate-400';
}

export function generatePagination(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}
