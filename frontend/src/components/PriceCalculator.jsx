import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { Calculator, TrendingUp, Clock, CloudRain, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PriceCalculator = ({ onPriceCalculated, initialData = {} }) => {
  const [formData, setFormData] = useState({
    category: initialData.category || 'plumbing',
    requiredSkills: initialData.requiredSkills || [],
    urgency: initialData.urgency || 'medium',
    estimatedDuration: initialData.estimatedDuration || 1,
    workingConditions: {
      weather: 'clear',
      isNightShift: false,
      isFestival: false,
      isWeekend: false
    },
    ...initialData
  });

  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const categories = [
    'plumbing', 'electrical', 'cleaning', 'carpentry', 'painting',
    'appliance-repair', 'pest-control', 'gardening', 'moving', 'delivery', 'other'
  ];

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getPrice(formData);
      setPricing(res.data.pricing);
      if (onPriceCalculated) onPriceCalculated(res.data.pricing);
      toast.success('AI price calculated!');
    } catch (error) {
      toast.error('Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill)
    });
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Calculator className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Price Calculator</h3>
          <p className="text-sm text-gray-500">Fair pricing based on task, skills & conditions</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g., pipe-fitting"
              className="input"
            />
            <button type="button" onClick={addSkill} className="btn-secondary whitespace-nowrap">
              Add
            </button>
          </div>
          {formData.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="badge bg-blue-100 text-blue-700 cursor-pointer hover:bg-red-100"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hrs)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.estimatedDuration}
              onChange={(e) =>
                setFormData({ ...formData, estimatedDuration: Number(e.target.value) })
              }
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Conditions</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.workingConditions.isNightShift}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingConditions: { ...formData.workingConditions, isNightShift: e.target.checked }
                  })
                }
                className="rounded"
              />
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Night Shift</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.workingConditions.isWeekend}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingConditions: { ...formData.workingConditions, isWeekend: e.target.checked }
                  })
                }
                className="rounded"
              />
              <span>Weekend</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.workingConditions.isFestival}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingConditions: { ...formData.workingConditions, isFestival: e.target.checked }
                  })
                }
                className="rounded"
              />
              <span>Festival</span>
            </label>
            <select
              value={formData.workingConditions.weather}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workingConditions: { ...formData.workingConditions, weather: e.target.value }
                })
              }
              className="input text-sm"
            >
              <option value="clear">Clear Weather</option>
              <option value="rain">Rainy</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          {loading ? 'Calculating...' : 'Calculate Fair Price'}
        </button>

        {pricing && (
          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">AI Recommended Price</span>
              <span className="badge bg-green-100 text-green-700">
                {Math.round(pricing.breakdown.aiConfidence * 100)}% confidence
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ₹{pricing.recommended}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Fair range: ₹{pricing.min} - ₹{pricing.max}
            </div>

            <div className="border-t border-green-200 pt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Price Breakdown:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>₹{pricing.breakdown.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Multiplier</span>
                  <span>×{pricing.breakdown.skillMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Urgency Multiplier</span>
                  <span>×{pricing.breakdown.urgencyMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Condition Multiplier</span>
                  <span>×{pricing.breakdown.conditionMultiplier?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Demand Multiplier</span>
                  <span>×{pricing.breakdown.demandMultiplier}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;