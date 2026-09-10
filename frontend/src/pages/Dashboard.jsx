import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workerAPI, gigAPI } from '../services/api';
import {
  Briefcase, Award, Star, TrendingUp, Plus, Users,
  CheckCircle, Clock, Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user.role === 'worker') {
        const [statsRes, gigsRes] = await Promise.all([
          workerAPI.getMyStats(),
          workerAPI.getMyGigs()
        ]);
        setStats(statsRes.data.stats);
        setGigs(gigsRes.data.gigs);
      } else {
        const gigsRes = await gigAPI.getAll({ limit: 10 });
        setGigs(gigsRes.data.gigs.filter((g) => g.customer?._id === user.id || g.customer === user.id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1 capitalize">
            {user.role} Dashboard
          </p>
        </div>

        {/* Worker Stats */}
        {user.role === 'worker' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.tokens}</div>
              <div className="text-sm text-gray-500">Tokens</div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.rating || 'N/A'}</div>
              <div className="text-sm text-gray-500">
                Rating ({stats.totalReviews} reviews)
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedGigs}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{stats.monthlyEarnings || 0}</div>
              <div className="text-sm text-gray-500">This Month</div>
            </div>
          </div>
        )}

        {/* Customer Actions */}
        {user.role === 'customer' && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/gigs/create"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Post New Gig</h3>
                <p className="text-sm text-gray-500">Get AI pricing & matched workers</p>
              </div>
            </Link>

            <Link
              to="/gigs"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Browse Gigs</h3>
                <p className="text-sm text-gray-500">View all open gigs</p>
              </div>
            </Link>

            <Link
              to="/workers"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Find Workers</h3>
                <p className="text-sm text-gray-500">Browse verified talent</p>
              </div>
            </Link>
          </div>
        )}

        {/* Worker Quick Actions */}
        {user.role === 'worker' && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/gigs"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Find Gigs</h3>
                <p className="text-sm text-gray-500">Browse available work</p>
              </div>
            </Link>

            <Link
              to="/tokens"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Tokens</h3>
                <p className="text-sm text-gray-500">View rewards & badges</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="card hover:scale-105 transition flex items-center space-x-4"
            >
              <div className="bg-orange-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-500">Skills & availability</p>
              </div>
            </Link>
          </div>
        )}

        {/* Recent Gigs */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {user.role === 'worker' ? 'My Active Gigs' : 'My Posted Gigs'}
            </h2>
            <Link to="/gigs" className="text-primary-600 text-sm font-semibold hover:underline">
              View All
            </Link>
          </div>

          {gigs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No gigs yet</p>
              {user.role === 'customer' && (
                <Link to="/gigs/create" className="btn-primary inline-block">
                  Post Your First Gig
                </Link>
              )}
              {user.role === 'worker' && (
                <Link to="/gigs" className="btn-primary inline-block">
                  Browse Available Gigs
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {gigs.slice(0, 5).map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gigs/${gig._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span className="capitalize">{gig.category}</span>
                        <span>•</span>
                        <span className="capitalize">{gig.status}</span>
                        <span>•</span>
                        <span>₹{gig.budget?.recommended || gig.budget?.final}</span>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        gig.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : gig.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : gig.status === 'completed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;