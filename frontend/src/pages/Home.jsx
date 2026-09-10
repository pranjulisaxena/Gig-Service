import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Zap, Award, Calculator, Shield, TrendingUp,
  Briefcase, CheckCircle, ArrowRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Worker Groups',
      desc: 'Multiple skilled workers collaborate on one gig, reducing customer cost and increasing efficiency.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Calculator,
      title: 'AI Fair Pricing',
      desc: 'Smart pricing considers task, skills, urgency, and work conditions for transparent rates.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Award,
      title: 'Token & Badge System',
      desc: 'Good work earns tokens that unlock progressive badges and certificates.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Zap,
      title: 'Emergency Pricing',
      desc: 'Night, rain, and festival work gets higher transparent pricing automatically.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Shield,
      title: 'Verified Talent',
      desc: 'AI-verified workers with skill validation and trust scores.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Lower Commission',
      desc: 'Fair platform fees ensure more earnings for workers and savings for customers.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const steps = [
    { num: 1, title: 'Post Gig', desc: 'Customer describes the task', color: 'bg-orange-500' },
    { num: 2, title: 'AI Price', desc: 'Get fair AI-recommended price', color: 'bg-blue-500' },
    { num: 3, title: 'Match Workers', desc: 'AI finds best-fit workers', color: 'bg-teal-500' },
    { num: 4, title: 'Form Group', desc: 'Optimal team assembled', color: 'bg-green-500' },
    { num: 5, title: 'Complete Work', desc: 'Track progress in real-time', color: 'bg-purple-500' },
    { num: 6, title: 'Tokens + Pay', desc: 'Workers earn tokens & payment', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Smart Automation • SIH 2026</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Cooperative Gig Services Platform
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              AI-powered platform connecting companies with verified talent. Fair pricing, worker
              groups, and transparent rewards for household & community services.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!user ? (
                <>
                  <Link to="/register" className="btn-accent text-lg px-8 py-3">
                    Get Started <ArrowRight className="inline w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold py-3 px-8 rounded-lg border-2 border-white/30 transition"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-accent text-lg px-8 py-3">
                  Go to Dashboard <ArrowRight className="inline w-5 h-5 ml-2" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { value: '60%', label: 'Lower Costs' },
                { value: '3x', label: 'Faster Hiring' },
                { value: '100%', label: 'Transparent' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Cooperative Gig?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built on innovation, transparency, and fairness for both workers and customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:scale-105 transition-transform">
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Six simple steps from posting to payment</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div
                  className={`w-16 h-16 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg`}
                >
                  {s.num}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 mb-8">
            Join the platform that's redefining household and community services.
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="btn-accent text-lg px-8 py-3">
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;