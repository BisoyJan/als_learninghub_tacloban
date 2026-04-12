import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh bg-[#FDFDFC] dark:bg-[#0a0a0a]">
            {/* Left panel — decorative */}
            <div className="relative hidden w-[45%] overflow-hidden lg:block">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-600 to-teal-700" />
                {/* Dot pattern */}
                <div className="cta-dot-pattern pointer-events-none absolute inset-0 opacity-[0.07]" />
                {/* Floating blobs */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="animate-float absolute -left-12 top-1/4 size-64 rounded-full bg-white/5 blur-3xl" />
                    <div className="animate-float-slow absolute -right-16 bottom-1/3 size-80 rounded-full bg-teal-400/10 blur-3xl" />
                </div>
                {/* Content */}
                <div className="relative flex h-full flex-col justify-between p-10">
                    <Link href={home()} className="flex items-center gap-3 text-white/90 transition-opacity hover:opacity-80">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white backdrop-blur-sm">
                            ALS
                        </div>
                        <span className="text-sm font-semibold tracking-tight">ALS Connect</span>
                    </Link>

                    <div className="max-w-sm">
                        <blockquote className="space-y-4">
                            <p className="text-lg leading-relaxed text-white/90">
                                &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
                            </p>
                            <footer className="text-sm text-white/60">
                                — Nelson Mandela
                            </footer>
                        </blockquote>
                    </div>

                    <p className="text-xs text-white/40">
                        Department of Education — Alternative Learning System
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
                {/* Mobile logo */}
                <div className="mb-8 lg:hidden">
                    <Link href={home()} className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            ALS
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-[#1b1b18] dark:text-[#EDEDEC]">
                            ALS Connect Tacloban
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-2xl font-bold tracking-tight text-[#1b1b18] dark:text-[#EDEDEC]">
                                {title}
                            </h1>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
