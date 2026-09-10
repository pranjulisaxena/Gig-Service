import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigAPI } from '../services/api';
import PriceCalculator from '../components/PriceCalculator';
import { Briefcase, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGig = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    requiredSkills: [],
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    scheduledDate: '',
    estimatedDuration: 1,
    urgency: 'medium',
    workingConditions: {
      weather: 'clear',
      isNightShift: false,
      isFestival: false,
      isWeekend: false
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await gigAPI.create({
        ...formData,
        budget: pricing
      });
      toast.success('Gig posted successfully!');
      navigate(`/gigs/${res.data.gig._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Gig</h1>
          <p className="text-gray-600 mt-1">Fill in the details and let AI recommend fair pricing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Pricing' },
            { n: 3, label: 'Confirm' }
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s.n}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step >= s.n ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-16 h-1 mx-4 ${step > s.n ? 'bg-primary-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="card space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gig Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="e.g., Fix leaking kitchen pipe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Describe the task in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    {['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting',
                      'appliance-repair', 'pest-control', 'gardening', 'moving', 'delivery', 'other'
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value }
                        })
                      }
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value }
                        })
                      }
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={formData.location.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, pincode: e.target.value }
                        })
                      }
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value }
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.title || !formData.description}
                  className="btn-primary w-full"
                >
                  Continue to Pricing
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <PriceCalculator
                  initialData={{
                    category: formData.category,
                    requiredSkills: formData.requiredSkills,
                    urgency: formData.urgency,
                    estimatedDuration: formData.estimatedDuration,
                    workingConditions: formData.workingConditions
                  }}
                  onPriceCalculated={setPricing}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!pricing}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="card space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900">Confirm Your Gig</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Title:</span>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium capitalize">{formData.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Urgency:</span>
                    <p className="font-medium capitalize">{formData.urgency}</p>
                  </div>
                  {pricing && (
                    <div>
                      <span className="text-gray-500">AI Recommended Price:</span>
                      <p className="font-bold text-2xl text-primary-600">₹{pricing.recommended}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Posting...' : 'Post Gig'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
              <h4 className="font-bold text-gray-900 mb-3">💡 Tips for Better Hiring</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be specific about the task</li>
                <li>• Add relevant skills needed</li>
                <li>• Mark urgency accurately</li>
                <li>• Set realistic duration</li>
                <li>• AI will match best workers</li>
              </ul>
            </div>

            <div className="card">
              <h4 className="font-bold text-gray-900 mb-3">🤖 AI Will Help With:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Fair price calculation</li>
                <li>✓ Best worker matching</li>
                <li>✓ Optimal group formation</li>
                <li>✓ Emergency pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;