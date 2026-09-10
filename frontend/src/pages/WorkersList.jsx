import React, { useEffect, useState } from 'react';
import { workerAPI } from '../services/api';
import { Search, Star, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkersList = () => {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const res = await workerAPI.getAll();
        setWorkers(res.data.workers || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load workers');
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredWorkers = workers.filter((worker) => {
    if (!normalizedSearch) return true;
    return [worker.name, worker.bio, ...(worker.skills || [])]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Workers</h1>
          <p className="text-gray-600 mt-1">Browse verified workers for your next gig</p>
        </div>

        <div className="card mb-6 relative">
          <Search className="absolute left-9 top-9 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or skill"
            className="input pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No workers found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
              <div key={worker._id || worker.id} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl">
                    {worker.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{worker.name}</h2>
                    {worker.isVerified && <span className="badge bg-blue-100 text-blue-700">Verified</span>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  <span><Star className="inline w-4 h-4 text-yellow-500" /> {worker.rating || 'N/A'}</span>
                  <span><Briefcase className="inline w-4 h-4" /> {worker.completedGigs || 0} completed</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(worker.skills || []).slice(0, 5).map((skill) => (
                    <span key={skill} className="badge bg-gray-100 text-gray-700">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkersList;
