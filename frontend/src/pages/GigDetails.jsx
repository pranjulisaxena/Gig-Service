import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigAPI, groupAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WorkerMatchCard from '../components/WorkerMatchCard';
import {
  MapPin, Clock, Zap, Users, Award, Star, CheckCircle,
  DollarSign, Calendar, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    fetchGig();
  }, [id]);

  const fetchGig = async () => {
    try {
      const res = await gigAPI.getOne(id);
      setGig(res.data.gig);
    } catch (error) {
      toast.error('Gig not found');
      navigate('/gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleFindWorkers = async () => {
    setActionLoading(true);
    try {
      const res = await gigAPI.matchWorkers(id);
      setMatches(res.data.matches);
      setShowMatches(true);
    } catch (error) {
      toast.error('Failed to find workers');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectWorker = (worker) => {
    setSelectedWorkers((prev) => {
      const workerId = worker._id || worker.id;
      const exists = prev.some((w) => (w._id || w.id) === workerId);
      if (exists) return prev.filter((w) => (w._id || w.id) !== workerId);
      if (prev.length >= 4) {
        toast.error('Maximum 4 workers per group');
        return prev;
      }
      return [...prev, worker];
    });
  };

  const handleFormGroup = async () => {
    if (selectedWorkers.length < 2) {
      toast.error('Select at least 2 workers');
      return;
    }
    setActionLoading(true);
    try {
      const res = await gigAPI.formGroup(id, {
        workerIds: selectedWorkers.map((w) => w._id || w.id),
        groupName: `${gig.title} - Team`
      });
      toast.success(`Group formed! Skill coverage: ${res.data.skillCoverage}%`);
      fetchGig();
      setShowMatches(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to form group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespond = async (status) => {
    setActionLoading(true);
    try {
      await gigAPI.respond(id, status);
      toast.success(`Invitation ${status}`);
      fetchGig();
    } catch (error) {
      toast.error('Failed to respond');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const res = await gigAPI.complete(id);
      toast.success('Gig completed! Tokens awarded.');
      fetchGig();
    } catch (error) {
      toast.error('Failed to complete gig');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!gig) return null;

  const isCustomer = user.id === gig.customer?._id || user.id === gig.customer;
  const myAssignment = gig.assignedWorkers?.find(
    (w) => w.worker?._id === user.id || w.worker === user.id
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge bg-primary-100 text-primary-700 capitalize mb-2">
                    {gig.category.replace('-', ' ')}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{gig.title}</h1>
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

              <p className="text-gray-700 mb-6 leading-relaxed">{gig.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span>{gig.location?.city || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>{gig.estimatedDuration}h</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                </div>
                {gig.urgency === 'emergency' && (
                  <div className="flex items-center space-x-2 text-red-600 font-semibold">
                    <Zap className="w-5 h-5" />
                    <span>Emergency</span>
                  </div>
                )}
              </div>

              {gig.requiredSkills?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.requiredSkills.map((skill) => (
                      <span key={skill} className="badge bg-blue-100 text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Price Breakdown */}
            {gig.pricingFactors && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">🤖 AI Pricing Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{gig.budget?.recommended}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Recommended</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{gig.budget?.min}-{gig.budget?.max}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Fair Range</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((gig.pricingFactors.aiConfidence || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">AI Confidence</div>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Workers */}
            {gig.assignedWorkers?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">
                  <Users className="inline w-5 h-5 mr-2" />
                  Assigned Team ({gig.assignedWorkers.length})
                </h3>
                <div className="space-y-3">
                  {gig.assignedWorkers.map((w, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                          {w.worker?.name?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {w.worker?.name || 'Worker'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {w.role} • {w.share}% share
                          </div>
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          w.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : w.status === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worker Matches */}
            {showMatches && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">AI-Matched Workers</h3>
                  <button
                    onClick={handleFormGroup}
                    disabled={selectedWorkers.length < 2 || actionLoading}
                    className="btn-primary text-sm"
                  >
                    Form Group ({selectedWorkers.length})
                  </button>
                </div>
                <div className="grid gap-3">
                  {matches.map((match, idx) => (
                    <WorkerMatchCard
                      key={idx}
                      match={match}
                      onSelect={handleSelectWorker}
                      selected={selectedWorkers.some(
                        (w) => (w._id || w.id) === (match.worker._id || match.worker.id)
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div className="text-sm opacity-90 mb-1">AI Recommended Price</div>
              <div className="text-4xl font-bold mb-1">₹{gig.budget?.recommended}</div>
              <div className="text-sm opacity-90">
                Range: ₹{gig.budget?.min} - ₹{gig.budget?.max}
              </div>
            </div>

            <div className="card">
              <h4 className="font-bold text-gray-900 mb-3">Customer</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                  {gig.customer?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{gig.customer?.name}</div>
                  <div className="text-sm text-gray-500">
                    {gig.customer?.companyName || 'Individual'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isCustomer && gig.status === 'open' && (
              <button
                onClick={handleFindWorkers}
                disabled={actionLoading}
                className="btn-primary w-full"
              >
                {actionLoading ? 'Finding...' : '🔍 Find Best Workers'}
              </button>
            )}

            {myAssignment && myAssignment.status === 'invited' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleRespond('accepted')}
                  disabled={actionLoading}
                  className="btn-primary w-full"
                >
                  ✓ Accept Invitation
                </button>
                <button
                  onClick={() => handleRespond('declined')}
                  disabled={actionLoading}
                  className="btn-secondary w-full"
                >
                  Decline
                </button>
              </div>
            )}

            {isCustomer && gig.status === 'in-progress' && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="btn-accent w-full"
              >
                <CheckCircle className="inline w-5 h-5 mr-2" />
                Mark Complete & Release Payment
              </button>
            )}

            {gig.status === 'completed' && (
              <div className="card bg-green-50 border border-green-200 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-700">Gig Completed!</p>
                <p className="text-sm text-green-600 mt-1">Tokens awarded to workers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;