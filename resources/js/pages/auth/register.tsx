import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create your account"
            description="Start your learning journey with ALS Connect"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Full name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Juan Dela Cruz"
                                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                                />
                                <InputError
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="role" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    I am a
                                </Label>
                                <Select
                                    name="role"
                                    defaultValue="student"
                                >
                                    <SelectTrigger
                                        id="role"
                                        tabIndex={3}
                                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student / Learner</SelectItem>
                                        <SelectItem value="teacher">Teacher / Facilitator</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={7}
                                className="font-medium text-emerald-600 no-underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
