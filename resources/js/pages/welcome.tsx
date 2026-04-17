import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { dashboard, login, register } from '@/routes';

// ── Intersection Observer hook for entrance animations ─────────────
function useAnimate<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    el.classList.add('in-view');
                    obs.unobserve(el);
                }
            },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return ref;
}

// ── Reusable section wrapper ───────────────────────────────────────
function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useAnimate();
    return (
        <section ref={ref} className={`fade-section ${className}`}>
            {children}
        </section>
    );
}

// ── Data ───────────────────────────────────────────────────────────
const capabilities = [
    {
        title: 'Learning Modules',
        description: 'Expert-curated lessons organized by strand and subject. Study at your own pace, anytime, anywhere.',
        color: 'emerald' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    },
    {
        title: 'Progress Tracking',
        description: 'Visualize your journey with grades, completion rates, and milestones all in one dashboard.',
        color: 'sky' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
    {
        title: 'Community Forum',
        description: 'Ask questions, share ideas, and collaborate with fellow ALS learners and educators.',
        color: 'violet' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
    },
    {
        title: 'Announcements',
        description: 'Never miss a schedule update, exam date, or important notice from your teachers.',
        color: 'amber' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
            </svg>
        ),
    },
    {
        title: 'Badges & Rewards',
        description: 'Earn recognition for your achievements and celebrate every learning milestone.',
        color: 'rose' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3.75a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
        ),
    },
    {
        title: 'Resource Library',
        description: 'Download worksheets, guides, and supplementary materials uploaded by your teachers.',
        color: 'teal' as const,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
        ),
    },
];

const colorMap = {
    emerald: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        ring: 'ring-emerald-500/20',
    },
    sky: {
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        text: 'text-sky-600 dark:text-sky-400',
        ring: 'ring-sky-500/20',
    },
    violet: {
        bg: 'bg-violet-500/10 dark:bg-violet-500/15',
        text: 'text-violet-600 dark:text-violet-400',
        ring: 'ring-violet-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        ring: 'ring-amber-500/20',
    },
    rose: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-600 dark:text-rose-400',
        ring: 'ring-rose-500/20',
    },
    teal: {
        bg: 'bg-teal-500/10 dark:bg-teal-500/15',
        text: 'text-teal-600 dark:text-teal-400',
        ring: 'ring-teal-500/20',
    },
};

const metrics = [
    { figure: '500+', label: 'Active Learners' },
    { figure: '50+', label: 'Course Modules' },
    { figure: '95%', label: 'Completion Rate' },
    { figure: '20+', label: 'Dedicated Teachers' },
];

const journey = [
    {
        num: 1,
        title: 'Sign Up',
        text: 'Create a free account with just your name and email — takes less than a minute.',
    },
    {
        num: 2,
        title: 'Browse & Learn',
        text: 'Explore modules organized by subject. Read, watch, and interact at your own pace.',
    },
    {
        num: 3,
        title: 'Earn & Grow',
        text: 'Track your grades, earn badges, and celebrate every milestone on your learning path.',
    },
];

// ── Component ──────────────────────────────────────────────────────
export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="ALS Connect Tacloban">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                {/* ─── Navbar ──────────────────────────────────────────── */}
                <nav className="fixed inset-x-0 top-0 z-50">
                    <div className="mx-auto max-w-6xl px-5 pt-4">
                        <div className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-white/80 px-5 py-2.5 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-900/80 dark:shadow-black/20">
                            <Link href="/" className="flex items-center gap-2.5">
                                <img src="/images/als-logo.png" alt="ALS" className="size-8" />
                                <span className="hidden text-sm font-semibold sm:inline">ALS Connect</span>
                            </Link>

                            <div className="flex items-center gap-1.5">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ─── Hero ────────────────────────────────────────────── */}
                <header className="relative isolate overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
                    {/* Background grid + radial glow */}
                    <div className="hero-grid pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]" />
                    <div className="hero-glow-primary pointer-events-none absolute top-[-20%] left-1/2 size-200 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-[120px] dark:bg-emerald-500/10" />
                    <div className="hero-glow-secondary pointer-events-none absolute right-[-10%] bottom-0 size-125 rounded-full bg-sky-400/10 blur-[100px] dark:bg-sky-500/5" />

                    <div className="relative mx-auto max-w-3xl px-5 text-center">
                        <div className="hero-enter-badge mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                            </svg>
                            DepEd — Alternative Learning System
                        </div>

                        <h1 className="hero-enter-heading text-5xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            Your learning{' '}
                            <span className="hero-gradient-text">journey</span>
                            ,{' '}
                            <br className="hidden sm:block" />
                            your pace.
                        </h1>

                        <p className="hero-enter-text mx-auto mt-7 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                            ALS Connect Tacloban is the all-in-one hub for Alternative Learning System learners and educators — study modules, track progress, and grow together.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-600/30"
                                >
                                    Open Dashboard
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-600/30"
                                    >
                                        Start Learning — Free
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hero illustration — floating app mockup cards */}
                    <div className="hero-enter-mockup relative mx-auto mt-16 max-w-4xl px-5 lg:mt-20">
                        <div className="hero-mockup-glow absolute inset-x-10 -top-4 bottom-0 rounded-3xl" />
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
                            {/* Fake browser chrome */}
                            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                                <span className="size-2.5 rounded-full bg-red-400" />
                                <span className="size-2.5 rounded-full bg-amber-400" />
                                <span className="size-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-3 flex-1 rounded-md bg-zinc-200/70 px-3 py-1 text-center text-xs text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                                    als-connect-tacloban.edu.ph
                                </span>
                            </div>
                            {/* Mock dashboard content */}
                            <div className="grid grid-cols-3 gap-4 p-5 lg:p-7">
                                <div className="col-span-2 rounded-xl bg-emerald-50/70 p-4 dark:bg-emerald-950/20">
                                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Welcome back!</p>
                                    <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">Your Dashboard</p>
                                    <div className="mt-3 flex gap-3">
                                        <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-zinc-800">
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">12</p>
                                            <p className="text-[10px] text-zinc-500">Modules</p>
                                        </div>
                                        <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-zinc-800">
                                            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">75%</p>
                                            <p className="text-[10px] text-zinc-500">Progress</p>
                                        </div>
                                        <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-zinc-800">
                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">3</p>
                                            <p className="text-[10px] text-zinc-500">Badges</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                                        <p className="text-[10px] font-medium text-zinc-500">Next Up</p>
                                        <p className="mt-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">Mathematics</p>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                            <div className="h-full w-3/5 rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                                        <p className="text-[10px] font-medium text-zinc-500">Recent Badge</p>
                                        <p className="mt-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">Fast Learner 🏆</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ─── Metrics Band ───────────────────────────────────── */}
                <Section className="border-y border-zinc-100 bg-zinc-50/60 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 py-14 sm:grid-cols-4 lg:py-16">
                        {metrics.map((m) => (
                            <div key={m.label} className="text-center">
                                <p className="text-3xl font-extrabold tracking-tight text-emerald-600 lg:text-4xl dark:text-emerald-400">
                                    {m.figure}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ─── Capabilities Grid ──────────────────────────────── */}
                <Section className="py-24 lg:py-32">
                    <div className="mx-auto max-w-6xl px-5">
                        <div className="mx-auto mb-14 max-w-xl text-center">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                Platform Features
                            </p>
                            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
                                Tools that help you succeed
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {capabilities.map((cap) => {
                                const c = colorMap[cap.color];
                                return (
                                    <div
                                        key={cap.title}
                                        className="stagger-card group relative rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20"
                                    >
                                        <div className={`mb-4 inline-flex rounded-xl p-3 ring-1 ${c.bg} ${c.text} ${c.ring}`}>
                                            {cap.icon}
                                        </div>
                                        <h3 className="mb-1.5 text-base font-semibold">{cap.title}</h3>
                                        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{cap.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Section>

                {/* ─── Journey / How it Works ─────────────────────────── */}
                <Section className="border-t border-zinc-100 bg-zinc-50/60 py-24 lg:py-32 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                    <div className="mx-auto max-w-4xl px-5">
                        <div className="mx-auto mb-14 max-w-xl text-center">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                Getting Started
                            </p>
                            <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
                                Three steps to your future
                            </h2>
                        </div>

                        {/* Vertical timeline */}
                        <div className="relative ml-6 border-l-2 border-emerald-200 pl-10 dark:border-emerald-800/60 md:ml-0 md:border-l-0 md:pl-0">
                            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-10">
                                {journey.map((step) => (
                                    <div key={step.num} className="relative">
                                        {/* Timeline dot — mobile only */}
                                        <div className="absolute -left-13 top-1 grid size-8 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-4 ring-zinc-50 md:static md:mb-5 md:ring-0 dark:ring-zinc-900/40 md:dark:ring-0">
                                            {step.num}
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                                        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ─── CTA ─────────────────────────────────────────────── */}
                <Section className="py-24 lg:py-32">
                    <div className="mx-auto max-w-6xl px-5">
                        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-20 text-center text-white lg:px-20 dark:bg-zinc-900">
                            {/* Decorative blobs */}
                            <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-emerald-500/20 blur-[100px]" />
                            <div className="pointer-events-none absolute -right-32 -bottom-32 size-80 rounded-full bg-sky-500/15 blur-[100px]" />

                            <div className="relative">
                                <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
                                    Start your learning journey today
                                </h2>
                                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400">
                                    Join hundreds of ALS learners in Tacloban City. It&apos;s completely free, and you can start in under a minute.
                                </p>

                                {!auth.user && (
                                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href={register()}
                                            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-400"
                                        >
                                            Create Free Account
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/50 px-7 py-3.5 text-base font-semibold text-zinc-300 transition hover:bg-zinc-800"
                                        >
                                            Sign In
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ─── Footer ─────────────────────────────────────────── */}
                <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
                    <div className="mx-auto max-w-6xl px-5 py-12">
                        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-xs">
                                <div className="mb-3 flex items-center gap-2.5">
                                    <img src="/images/als-logo.png" alt="ALS" className="size-7" />
                                    <span className="text-sm font-semibold">ALS Connect Tacloban</span>
                                </div>
                                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    An integrated learning hub built for ALS learners and educators in Anibong, Tacloban City.
                                </p>
                            </div>

                            <div className="flex gap-16">
                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                        Links
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        <li>
                                            <Link href={login()} className="text-zinc-500 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Log in</Link>
                                        </li>
                                        {canRegister && (
                                            <li>
                                                <Link href={register()} className="text-zinc-500 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Register</Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                        About
                                    </h4>
                                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                        Department of Education<br />
                                        Alternative Learning System<br />
                                        Anibong, Tacloban City
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
                            &copy; {new Date().getFullYear()} ALS Connect Tacloban. Department of Education — Alternative Learning System.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
