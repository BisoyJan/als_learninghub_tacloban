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
                                <Label htmlFor="name" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                                    className="h-11 rounded-lg border-[#e3e3e0] bg-white px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                />
                                <InputError
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                                    className="h-11 rounded-lg border-[#e3e3e0] bg-white px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="role" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    I am a
                                </Label>
                                <Select
                                    name="role"
                                    defaultValue="student"
                                >
                                    <SelectTrigger
                                        id="role"
                                        tabIndex={3}
                                        className="h-11 rounded-lg border-[#e3e3e0] bg-white px-4 dark:border-[#3E3E3A] dark:bg-[#161615]"
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
                                    <Label htmlFor="password" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                                        className="h-11 rounded-lg border-[#e3e3e0] bg-white px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
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
                                        className="h-11 rounded-lg border-[#e3e3e0] bg-white px-4 transition-colors focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
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
