import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        title: 'Learning Modules',
        description: 'Access structured learning materials organized by subject and strand, designed for ALS learners.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    },
    {
        title: 'Progress Tracking',
        description: 'Monitor your learning journey with detailed progress records, grades, and completion status.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
    {
        title: 'Community Forum',
        description: 'Engage with fellow learners and teachers through discussion forums for collaborative learning.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
    },
    {
        title: 'Announcements',
        description: 'Stay updated with the latest news, schedules, and important announcements from your teachers.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
            </svg>
        ),
    },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="ALS Learning Hub - Tacloban">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b border-[#e3e3e0] bg-[#FDFDFC]/80 backdrop-blur-md dark:border-[#3E3E3A] dark:bg-[#0a0a0a]/80">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                                ALS
                            </div>
                            <span className="text-lg font-semibold">ALS Connect Tacloban</span>
                        </div>
                        <nav className="flex items-center gap-3">
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
                                        className="rounded-lg px-5 py-2 text-sm font-medium transition-colors hover:bg-[#e3e3e0] dark:hover:bg-[#1C1C1A]"
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

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-[#FDFDFC] to-teal-50 dark:from-emerald-950/20 dark:via-[#0a0a0a] dark:to-teal-950/20" />
                    <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-36">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                DepEd — Alternative Learning System
                            </div>
                            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
                                Your Path to
                                <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400"> Learning </span>
                                Starts Here
                            </h1>
                            <p className="mb-10 text-lg text-[#706f6c] lg:text-xl dark:text-[#A1A09A]">
                                An integrated web hub for learning, communication, and progress tracking — built for ALS learners and educators in Tacloban City.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30"
                                    >
                                        Go to Dashboard
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30"
                                        >
                                            Get Started
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#e3e3e0] px-8 py-3.5 text-base font-semibold transition-colors hover:bg-[#e3e3e0]/50 dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A]"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t border-[#e3e3e0] bg-white py-20 lg:py-28 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
                                Everything You Need to Succeed
                            </h2>
                            <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                A complete platform designed to support Alternative Learning System learners every step of the way.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-[#e3e3e0] bg-[#FDFDFC] p-6 transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-600/5 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:hover:border-emerald-800"
                                >
                                    <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:group-hover:bg-emerald-950/80">
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

                {/* CTA Section */}
                <section className="border-t border-[#e3e3e0] py-20 lg:py-28 dark:border-[#3E3E3A]">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 px-8 py-16 text-center text-white shadow-2xl shadow-emerald-600/20 lg:px-16">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
                                Ready to Start Learning?
                            </h2>
                            <p className="mx-auto mb-8 max-w-xl text-lg text-emerald-100">
                                Join ALS Connect Tacloban and take the next step in your educational journey. It&apos;s free and open for all ALS learners.
                            </p>
                            {!auth.user && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
                                >
                                    Create Your Account
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-[#e3e3e0] py-8 dark:border-[#3E3E3A]">
                    <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <p>&copy; {new Date().getFullYear()} ALS Connect Tacloban. Department of Education — Alternative Learning System.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
