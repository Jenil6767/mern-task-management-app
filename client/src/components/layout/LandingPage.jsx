import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] overflow-hidden">
            {/* Hero Section */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg">
                        TM
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">TaskManager</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-5 py-2 text-gray-600 font-semibold hover:text-blue-600 transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="btn-primary">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
                {/* Decorative Background */}
                <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -z-10 animate-float" />
                <div className="absolute bottom-[0%] left-[-5%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '-3s' }} />

                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                        Manage your tasks with <span className="gradient-text">Absolute Precision</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                        The ultimate multi-tenant task management platform for teams who demand performance,
                        security, and a beautiful interface.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="btn-primary px-8 py-4 text-lg">
                            Create Your Organization
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:shadow-lg transition-all text-lg">
                            Sign In to Existing
                        </Link>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-32">
                    <FeatureCard
                        icon={<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        title="Secure Multi-Tenancy"
                        description="Complete data isolation at the organization level using enterprise-grade security middleware."
                    />
                    <FeatureCard
                        icon={<svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        title="Optimistic UI"
                        description="Lightning fast interactions with instant feedback and reliable server-side rollbacks."
                    />
                    <FeatureCard
                        icon={<svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" /></svg>}
                        title="Race Condition Prevention"
                        description="Built-in optimistic locking ensures your data remains consistent even during high concurrency."
                    />
                </div>
            </main>

            <footer className="border-t border-gray-100 py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500">© 2026 TaskManager Platform. Built for Excellence.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        <div className="mb-4 inline-block p-3 bg-gray-50 rounded-xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed font-medium">{description}</p>
    </div>
);

export default LandingPage;
