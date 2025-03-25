import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup state
    const [signupEmail, setSignupEmail] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupGender, setSignupGender] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!loginEmail || !loginPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) throw error;

            toast.success('Logged in successfully!');
            navigate('/wardrobe');
        } catch (error: any) {
            toast.error(error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (
            !signupEmail ||
            !signupName ||
            !signupGender ||
            !signupPassword ||
            !signupConfirmPassword
        ) {
            toast.error('Please fill in all fields');
            return;
        }

        // Password confirmation check
        if (signupPassword !== signupConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        
        try {
            const { error } = await supabase.auth.signUp({
                email: signupEmail,
                password: signupPassword,
                options: {
                    data: {
                        name: signupName,
                        gender: signupGender,
                    },
                },
            });

            if (error) throw error;

            toast.success(
                'Registration successful! Check your email for confirmation.'
            );
            setIsLogin(true);
        } catch (error: any) {
            toast.error(error.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 px-4 pb-20 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isLogin
                                ? 'Sign in to access your wardrobe'
                                : 'Create an account to start organizing your wardrobe'}
                        </p>
                    </div>

                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="login-email" className="block">
                                    Email
                                </label>
                                <Input
                                    id="login-email"
                                    value={loginEmail}
                                    onChange={(e) =>
                                        setLoginEmail(e.target.value)
                                    }
                                    placeholder="Your email"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="login-password"
                                    className="block"
                                >
                                    Password
                                </label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) =>
                                        setLoginPassword(e.target.value)
                                    }
                                    placeholder="Your password"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Sign In'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="signup-email" className="block">
                                    Email
                                </label>
                                <Input
                                    id="signup-email"
                                    value={signupEmail}
                                    onChange={(e) =>
                                        setSignupEmail(e.target.value)
                                    }
                                    placeholder="Your email"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="signup-name" className="block">
                                    Full Name
                                </label>
                                <Input
                                    id="signup-name"
                                    value={signupName}
                                    onChange={(e) =>
                                        setSignupName(e.target.value)
                                    }
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-gender"
                                    className="block"
                                >
                                    Gender
                                </label>
                                <Select
                                    value={signupGender}
                                    onValueChange={setSignupGender}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-password"
                                    className="block"
                                >
                                    Password
                                </label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    value={signupPassword}
                                    onChange={(e) =>
                                        setSignupPassword(e.target.value)
                                    }
                                    placeholder="Your password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="signup-confirm-password"
                                    className="block"
                                >
                                    Confirm Password
                                </label>
                                <Input
                                    id="signup-confirm-password"
                                    type="password"
                                    value={signupConfirmPassword}
                                    onChange={(e) =>
                                        setSignupConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm your password"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Create Account'}
                            </Button>
                        </form>
                    )}

                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                // Reset all form fields when switching
                                setLoginEmail('');
                                setLoginPassword('');
                                setSignupEmail('');
                                setSignupName('');
                                setSignupGender('');
                                setSignupPassword('');
                                setSignupConfirmPassword('');
                            }}
                            className="text-primary hover:underline text-sm"
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Auth;
