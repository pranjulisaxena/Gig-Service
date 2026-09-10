import React, { useEffect, useState } from 'react';
import { workerAPI, tokenAPI } from '../services/api';
import { Award, TrendingUp, Gift, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Tokens = () => {
  const [data, setData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const [tokenRes, badgesRes] = await Promise.all([
        workerAPI.getMyTokens(),
        workerAPI.getBadges()
      ]);
      setData(tokenRes.data);
      setBadges(badgesRes.data.badges);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (amount, purpose) => {
    try {
      await tokenAPI.redeem(amount, purpose);
      toast.success('Tokens redeemed!');
      fetchTokens();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Redemption failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const earnedBadgeNames = data?.badges?.map((b) => b.name) || [];

  const rewards = [
    { tokens: 100, label: '₹50 Platform Discount', icon: '🎁' },
    { tokens: 250, label: 'Priority Gig Access', icon: '⚡' },
    { tokens: 500, label: 'Featured Profile', icon: '⭐' },
    { tokens: 1000, label: 'Premium Certification', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tokens & Badges</h1>
        <p className="text-gray-600 mb-8">
          Earn tokens for quality work and unlock progressive badges
        </p>

        {/* Token Balance */}
        <div className="card bg-gradient-to-br from-purple-600 to-purple-800 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Your Token Balance</div>
              <div className="text-5xl font-bold flex items-center space-x-3">
                <Award className="w-12 h-12" />
                <span>{data?.balance || 0}</span>
              </div>
              <div className="text-sm opacity-90 mt-2">
                Unlock rewards and certifications
              </div>
            </div>
            <TrendingUp className="w-24 h-24 opacity-20" />
          </div>
        </div>

        {/* Earned Badges */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <Star className="inline w-5 h-5 mr-2 text-yellow-500" />
            Your Badges ({data?.badges?.length || 0})
          </h2>
          {data?.badges?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Complete gigs to earn your first badge!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-5xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Badges */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Available Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge) => {
              const earned = earnedBadgeNames.includes(badge.name);
              return (
                <div
                  key={badge._id}
                  className={`text-center p-4 rounded-lg border-2 transition ${
                    earned
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</div>
                  <div className="text-xs text-gray-500 mb-1">{badge.description}</div>
                  <span
                    className={`badge text-xs ${
                      earned ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {earned ? '✓ Earned' : `${badge.threshold} needed`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redeem Rewards */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <Gift className="inline w-5 h-5 mr-2 text-purple-600" />
            Redeem Rewards
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((r) => (
              <div key={r.tokens} className="card bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-3xl mb-2">{r.icon}</div>
                <div className="font-semibold text-gray-900 mb-2">{r.label}</div>
                <div className="text-sm text-gray-600 mb-3">{r.tokens} tokens</div>
                <button
                  onClick={() => handleRedeem(r.tokens, r.label)}
                  disabled={(data?.balance || 0) < r.tokens}
                  className={`w-full text-sm ${
                    (data?.balance || 0) >= r.tokens ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  {(data?.balance || 0) >= r.tokens ? 'Redeem' : 'Not enough'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Token History */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
          {data?.history?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {data.history.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Award
                        className={`w-5 h-5 ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tx.reason}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.reference}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tokens;