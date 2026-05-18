export type UserRole = 'admin' | 'teacher' | 'student';
export type EducationLevel = 'elementary' | 'junior_high' | 'senior_high';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    education_level: EducationLevel | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
