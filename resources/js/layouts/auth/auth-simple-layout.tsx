import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 size-160 rounded-full bg-emerald-100/60 blur-[120px] dark:bg-emerald-900/20" />
                <div className="absolute -bottom-40 -right-40 size-160 rounded-full bg-sky-100/50 blur-[120px] dark:bg-sky-900/15" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Link href={home()} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                        <img src="/images/als-logo.png" alt="ALS" className="size-9" />
                        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            ALS Connect
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-zinc-950/30">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    Department of Education — Alternative Learning System
                </p>
            </div>
        </div>
    );
}
