import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gigAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Clock, Zap } from 'lucide-react';

const GigsList = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchGigs();
  }, [filters.category, filters.city, filters.status]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.status) params.status = filters.status;

      const res = await gigAPI.getAll(params);
      let filtered = res.data.gigs;

      if (filters.search) {
        filtered = filtered.filter(
          (g) =>
            g.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            g.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setGigs(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'plumbing', 'electrical', 'cleaning', 'carpentry', 'painting',
    'appliance-repair', 'pest-control', 'gardening', 'moving', 'delivery', 'other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Gigs</h1>
            <p className="text-gray-600 mt-1">
              {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} available
            </p>
          </div>
          {user?.role === 'customer' && (
            <Link to="/gigs/create" className="btn-primary">
              + Post New Gig
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="input"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="card text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No gigs found matching your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.map((gig) => (
              <Link
                key={gig._id}
                to={`/gigs/${gig._id}`}
                className="card hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge bg-primary-100 text-primary-700 capitalize">
                    {gig.category.replace('-', ' ')}
                  </span>
                  <span
                    className={`badge ${
                      gig.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : gig.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {gig.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{gig.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gig.description}</p>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{gig.location?.city || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{gig.estimatedDuration}h estimated</span>
                  </div>
                  {gig.urgency === 'emergency' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">Emergency</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Budget</span>
                    <div className="font-bold text-lg text-gray-900">
                      ₹{gig.budget?.recommended || gig.budget?.final || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">By</span>
                    <div className="text-sm font-medium text-gray-700">
                      {gig.customer?.name || 'Customer'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigsList;