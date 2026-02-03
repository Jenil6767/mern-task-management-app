import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';
import { toast } from 'react-hot-toast';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        inviteCode: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!validateRequired(formData.name)) {
            newErrors.name = 'Name is required';
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.inviteCode && !validateRequired(formData.organizationName)) {
            newErrors.organizationName = 'Organization name is required if not using an invite code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            const { user, token } = response.data;

            login(user, token);
            toast.success('Registration successful!');
            navigate('/projects');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Manager</h1>
                    <p className="text-gray-600">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        error={errors.name}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        error={errors.email}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                    />

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-xs text-gray-500 mb-4 text-center">
                            Register a new organization OR join an existing one
                        </p>

                        <Input
                            label="Organization Name"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            placeholder="My Awesome Company"
                            error={errors.organizationName}
                            disabled={!!formData.inviteCode}
                        />

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500 font-medium italic">OR USE INVITE CODE</span>
                            </div>
                        </div>

                        <Input
                            label="Invite Code"
                            name="inviteCode"
                            value={formData.inviteCode}
                            onChange={handleChange}
                            placeholder="e.g. 8a2f1b..."
                            disabled={!!formData.organizationName}
                        />
                    </div>

                    {apiError && <ErrorMessage message={apiError} />}

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="w-full mt-6"
                    >
                        Register
                    </Button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
