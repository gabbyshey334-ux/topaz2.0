import { useState, useEffect } from 'react';
import { Award, RefreshCw, Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSeasonLeaderboard } from '../supabase/medalParticipants';
import { resetAllMedalPointsGlobally } from '../supabase/dataManagement';
import LoadingSpinner from './LoadingSpinner';
import { RankIcon, MedalLevelIcon } from './AppIcons';

function MedalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await getSeasonLeaderboard(20);
      if (result.success) {
        setLeaderboard(result.data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetLeaderboard = async () => {
    const confirm1 = window.confirm(
      'This will reset ALL medal points for ALL participants to 0. ' +
      'The leaderboard will be cleared. ' +
      'This cannot be undone. Continue?'
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      'FINAL CONFIRMATION: Clear the entire medal leaderboard?'
    );
    if (!confirm2) return;

    setResetting(true);
    try {
      const result = await resetAllMedalPointsGlobally();
      if (result.success) {
        toast.success('Medal leaderboard has been cleared. All medal points reset to 0.');
        await loadLeaderboard();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      toast.error(`Failed to reset leaderboard: ${error.message}`);
    } finally {
      setResetting(false);
    }
  };

  const getMedalColor = (level) => {
    switch (level) {
      case 'Gold':
        return 'from-yellow-400 to-amber-500';
      case 'Silver':
        return 'from-gray-300 to-gray-400';
      case 'Bronze':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  const getRankDisplay = (rank) => {
    if (rank >= 1 && rank <= 3) {
      return <RankIcon rank={rank} size={28} />;
    }
    return <span className="text-2xl font-bold text-gray-700">{rank}.</span>;
  };

  const resetButton = (
    <button
      type="button"
      onClick={handleResetLeaderboard}
      disabled={resetting}
      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
    >
      {resetting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Resetting...
        </>
      ) : (
        <>
          <RefreshCw size={18} />
          Reset Medal Leaderboard
        </>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <Award size={64} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Medal Data Yet</h3>
          <p className="text-gray-600 mb-6">
            Medal points will appear here once competitions are scored and 1st place winners are awarded.
          </p>
          <div className="admin-actions flex justify-center">
            {resetButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Award size={36} className="text-white" />
          <h2 className="text-3xl font-black text-white">SEASON MEDAL LEADERBOARD</h2>
          <Award size={36} className="text-white" />
        </div>
        <p className="text-center text-white/90 font-semibold">
          Top {leaderboard.length} Performers
        </p>
      </div>

      <div className="admin-actions px-6 py-4 bg-amber-50 border-b border-amber-200 flex justify-center">
        {resetButton}
      </div>

      <div className="divide-y divide-gray-200">
        {leaderboard.map((participant) => (
          <div
            key={participant.id}
            className={`p-5 hover:bg-gray-50 transition-colors ${
              participant.rank <= 3 ? 'bg-gradient-to-r ' + getMedalColor(participant.current_medal_level) + ' bg-opacity-10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 text-center flex justify-center">
                {getRankDisplay(participant.rank)}
              </div>

              <div className="flex items-center justify-center">
                <MedalLevelIcon level={participant.current_medal_level} size={36} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {participant.participant_name}
                </h3>

                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-teal-600">
                      {participant.total_points}
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {participant.total_points === 1 ? 'point' : 'points'}
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMedalColor(participant.current_medal_level)} text-white font-bold text-sm shadow-md`}>
                    {participant.current_medal_level} Medal
                  </div>
                </div>

                {participant.pointsToNext > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-semibold">
                        Progress to {participant.nextLevel}
                      </span>
                      <span className="text-teal-600 font-bold">
                        {participant.pointsToNext} {participant.pointsToNext === 1 ? 'point' : 'points'} to go!
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((participant.total_points % 25) /
                            (participant.nextLevel === 'Bronze' ? 25 : participant.nextLevel === 'Silver' ? 10 : 15)) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {participant.current_medal_level === 'Gold' && participant.pointsToNext === 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                      <Sparkles size={16} />
                      Gold Medal Achieved!
                      <Sparkles size={16} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3">Medal Requirements:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
            <MedalLevelIcon level="Bronze" size={32} />
            <div>
              <div className="font-bold text-orange-800">Bronze Medal</div>
              <div className="text-sm text-orange-700">25-34 points</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
            <MedalLevelIcon level="Silver" size={32} />
            <div>
              <div className="font-bold text-gray-800">Silver Medal</div>
              <div className="text-sm text-gray-700">35-49 points</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
            <MedalLevelIcon level="Gold" size={32} />
            <div>
              <div className="font-bold text-yellow-800">Gold Medal</div>
              <div className="text-sm text-yellow-700">50+ points</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center flex items-center justify-center gap-1">
          <Lightbulb size={14} className="flex-shrink-0" />
          Earn 1 point for each 1st place finish in Medal Program entries. Group members each earn individual points!
        </p>
      </div>
    </div>
  );
}

export default MedalLeaderboard;
