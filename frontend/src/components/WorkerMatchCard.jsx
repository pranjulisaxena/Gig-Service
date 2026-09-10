import React from 'react';
import { Star, Award, MapPin, Briefcase } from 'lucide-react';

const WorkerMatchCard = ({ match, onSelect, selected }) => {
  const { worker, matchPercentage, reasons } = match;

  return (
    <div
      onClick={() => onSelect && onSelect(worker, matchPercentage)}
      className={`card cursor-pointer border-2 transition-all ${
        selected ? 'border-primary-500 bg-primary-50' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {worker.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-gray-900">{worker.name}</h4>
              {worker.isVerified && (
                <span className="badge bg-blue-100 text-blue-700">✓ Verified</span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{worker.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4" />
                <span>{worker.experience}y exp</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{matchPercentage}%</div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      {worker.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {worker.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="badge bg-gray-100 text-gray-700">
              {skill}
            </span>
          ))}
        </div>
      )}

      {reasons?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Why this match:</p>
          <ul className="text-xs text-gray-500 space-y-0.5">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {worker.hourlyRate > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600">Hourly Rate</span>
          <span className="font-bold text-gray-900">₹{worker.hourlyRate}/hr</span>
        </div>
      )}
    </div>
  );
};

export default WorkerMatchCard;