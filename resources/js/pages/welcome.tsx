import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { dashboard, login, register } from '@/routes';

// ── Scroll-reveal hook (lightweight IntersectionObserver) ──────────
function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el); } },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return ref;
}

// ── Data ───────────────────────────────────────────────────────────
const features = [
    {
        title: 'Learning Modules',
        description: 'Structured materials organized by subject and strand, designed specifically for ALS learners.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    },
    {
        title: 'Progress Tracking',
        description: 'Monitor your journey with detailed progress records, grades, and completion status in real time.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
    {
        title: 'Community Forum',
        description: 'Engage with fellow learners and teachers through threaded discussions for collaborative learning.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
    },
    {
        title: 'Announcements',
        description: 'Stay updated with the latest news, schedules, and important updates from your teachers.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
            </svg>
        ),
    },
];

const stats = [
    { value: '500+', label: 'Learners Enrolled' },
    { value: '50+', label: 'Learning Modules' },
    { value: '95%', label: 'Completion Rate' },
    { value: '20+', label: 'Active Teachers' },
];

const steps = [
    {
        step: '01',
        title: 'Create Your Account',
        description: 'Sign up for free — all you need is a name and email to get started.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        ),
    },
    {
        step: '02',
        title: 'Explore Modules',
        description: 'Browse learning materials organized by subject and strand at your own pace.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        ),
    },
    {
        step: '03',
        title: 'Track Your Progress',
        description: 'Monitor completion status, earn badges, and celebrate your learning milestones.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
        ),
    },
];

// ── Component ──────────────────────────────────────────────────────
export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    const statsRef = useReveal();
    const featuresRef = useReveal();
    const stepsRef = useReveal();
    const ctaRef = useReveal();

    return (
        <>
            <Head title="ALS Learning Hub - Tacloban">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* ─── Navigation ─────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b border-[#e3e3e0]/60 bg-[#FDFDFC]/70 backdrop-blur-xl dark:border-[#3E3E3A]/60 dark:bg-[#0a0a0a]/70">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                                ALS
                            </div>
                            <span className="text-base font-semibold tracking-tight">ALS Connect</span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[#f0f0ee] dark:hover:bg-[#1C1C1A]"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ─── Hero Section ───────────────────────────────────── */}
                <section className="relative overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-50/80 via-[#FDFDFC] to-teal-50/60 dark:from-emerald-950/20 dark:via-[#0a0a0a] dark:to-teal-950/10" />

                    {/* Floating decorative shapes */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="animate-float absolute -right-16 top-20 size-72 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-800/10" />
                        <div className="animate-float-slow absolute -left-24 bottom-10 size-96 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-800/10" />
                        <div className="animate-float absolute right-1/4 top-1/3 size-5 rounded-full bg-emerald-400/30 dark:bg-emerald-400/10" />
                        <div className="animate-float-slow absolute left-1/5 top-1/4 size-3 rounded-full bg-teal-400/40 dark:bg-teal-400/15" />
                        <div className="animate-float absolute bottom-1/4 right-1/3 size-4 rounded-full bg-emerald-300/25 dark:bg-emerald-500/10" />
                    </div>

                    <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-5 lg:items-center lg:gap-16 lg:py-36">
                        {/* Left — text content (3 cols) */}
                        <div className="lg:col-span-3">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                DepEd — Alternative Learning System
                            </div>

                            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                                Flexible Learning
                                <br />
                                <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                                    for Everyone
                                </span>
                            </h1>

                            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#706f6c] lg:text-xl dark:text-[#A1A09A]">
                                Master new skills at your own pace with expert-curated modules — built for ALS learners and educators in Tacloban City.
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25"
                                    >
                                        Go to Dashboard
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25"
                                        >
                                            Get Started Free
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#e3e3e0] px-8 py-3.5 text-base font-semibold transition-colors hover:bg-[#f0f0ee] dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A]"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right — decorative visual (2 cols) */}
                        <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center">
                            <div className="relative">
                                {/* Glow */}
                                <div className="absolute -inset-6 rounded-3xl bg-emerald-400/10 blur-2xl dark:bg-emerald-400/5" />
                                {/* Card stack */}
                                <div className="relative space-y-4">
                                    <div className="animate-float flex items-center gap-4 rounded-2xl border border-[#e3e3e0] bg-white/80 p-5 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Mathematics Module</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">12 lessons · Beginner</p>
                                        </div>
                                        <div className="ml-auto rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                            New
                                        </div>
                                    </div>

                                    <div className="animate-float-slow ml-6 flex items-center gap-4 rounded-2xl border border-[#e3e3e0] bg-white/80 p-5 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Your Progress</p>
                                            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                                <div className="h-full w-3/4 rounded-full bg-linear-to-r from-emerald-500 to-teal-500" />
                                            </div>
                                        </div>
                                        <span className="ml-auto text-sm font-bold text-emerald-600 dark:text-emerald-400">75%</span>
                                    </div>

                                    <div className="animate-float-delayed flex items-center gap-4 rounded-2xl border border-[#e3e3e0] bg-white/80 p-5 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3.75a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Badge Earned!</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Fast Learner 🏆</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Statistics Strip ───────────────────────────────── */}
                <section ref={statsRef} className="scroll-reveal border-t border-[#e3e3e0]/60 bg-white dark:border-[#3E3E3A]/60 dark:bg-[#111110]">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#e3e3e0]/60 px-6 py-14 sm:grid-cols-4 dark:divide-[#3E3E3A]/60 lg:py-16">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-2">
                                <span className="text-3xl font-bold tracking-tight text-emerald-600 lg:text-4xl dark:text-emerald-400">
                                    {stat.value}
                                </span>
                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Features Section ───────────────────────────────── */}
                <section ref={featuresRef} className="scroll-reveal py-24 lg:py-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-emerald-500" />
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
                                Everything You Need to Succeed
                            </h2>
                            <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                A complete platform designed to support Alternative Learning System learners every step of the way.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-[#e3e3e0] bg-[#FDFDFC] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5 dark:border-[#3E3E3A] dark:bg-[#111110] dark:hover:border-emerald-800"
                                >
                                    <div className="mb-5 inline-flex rounded-xl bg-emerald-50 p-3.5 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:group-hover:bg-emerald-950/80">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── How It Works ───────────────────────────────────── */}
                <section ref={stepsRef} className="scroll-reveal border-t border-[#e3e3e0]/60 bg-white py-24 lg:py-32 dark:border-[#3E3E3A]/60 dark:bg-[#111110]">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-teal-500" />
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
                                How It Works
                            </h2>
                            <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                Get started in three simple steps — no complicated setup required.
                            </p>
                        </div>

                        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
                            {/* Connector line (desktop only) */}
                            <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-linear-to-r from-transparent via-emerald-300 to-transparent md:block dark:via-emerald-700" />

                            {steps.map((item) => (
                                <div key={item.step} className="relative flex flex-col items-center text-center">
                                    <div className="relative z-10 mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-4 ring-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-[#111110]">
                                        {item.icon}
                                    </div>
                                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
                                        Step {item.step}
                                    </span>
                                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                                    <p className="max-w-xs text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA Section ────────────────────────────────────── */}
                <section ref={ctaRef} className="scroll-reveal py-24 lg:py-32">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 px-8 py-20 text-center text-white shadow-2xl shadow-emerald-600/20 lg:px-16">
                            {/* Subtle pattern overlay */}
                            <div className="cta-dot-pattern pointer-events-none absolute inset-0 opacity-[0.07]" />

                            <div className="relative">
                                <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
                                    Ready to Start Learning?
                                </h2>
                                <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-emerald-100">
                                    Join ALS Connect Tacloban and take the next step in your educational journey. It&apos;s free and open for all ALS learners.
                                </p>
                                {!auth.user && (
                                    <Link
                                        href={register()}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
                                    >
                                        Create Your Account
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Footer ─────────────────────────────────────────── */}
                <footer className="border-t border-[#e3e3e0]/60 py-12 dark:border-[#3E3E3A]/60">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                            {/* Brand */}
                            <div>
                                <div className="mb-3 flex items-center gap-2.5">
                                    <div className="flex size-7 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
                                        ALS
                                    </div>
                                    <span className="text-sm font-semibold">ALS Connect Tacloban</span>
                                </div>
                                <p className="max-w-xs text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                    An integrated web hub for learning, communication, and progress tracking for ALS learners.
                                </p>
                            </div>

                            {/* Links */}
                            <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#706f6c] dark:text-[#A1A09A]">
                                    Quick Links
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href={login()} className="text-[#706f6c] transition-colors hover:text-emerald-600 dark:text-[#A1A09A] dark:hover:text-emerald-400">
                                            Log in
                                        </Link>
                                    </li>
                                    {canRegister && (
                                        <li>
                                            <Link href={register()} className="text-[#706f6c] transition-colors hover:text-emerald-600 dark:text-[#A1A09A] dark:hover:text-emerald-400">
                                                Register
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Info */}
                            <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#706f6c] dark:text-[#A1A09A]">
                                    About
                                </h4>
                                <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                    Department of Education
                                    <br />
                                    Alternative Learning System
                                    <br />
                                    Anibong, Tacloban City
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-[#e3e3e0]/60 pt-6 text-center text-xs text-[#706f6c] dark:border-[#3E3E3A]/60 dark:text-[#A1A09A]">
                            &copy; {new Date().getFullYear()} ALS Connect Tacloban. Department of Education — Alternative Learning System.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
