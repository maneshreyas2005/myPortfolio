import React, { useEffect, useState } from 'react';
import { User, Activity, Clock } from 'lucide-react';
import { fetchAnalyticsRealtime } from '../../dataFetch';

export default function RealtimeWidget({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAnalyticsRealtime(token);
        setData(result);
      } catch {
        // Silently fail - realtime is best-effort
      }
    };

    load();
    const id = setInterval(load, 30000); // poll every 30s

    return () => clearInterval(id);
  }, [token]);

  if (!data) {
    return (
      <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 h-64 sm:h-80 flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black">Live Visitors</h2>
            <p className="text-xs text-white/40">Real-time activity (last 5 min)</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
            <Clock size={20} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/30 animate-pulse">– visitors</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8 h-64 sm:h-80 flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black">Live Visitors</h2>
          <p className="text-xs text-white/40">Real-time activity (last 5 min)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
          <span className="text-xs font-bold text-white/60">Active now</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between mb-4">
        <div className="text-4xl sm:text-5xl font-black tabular-nums text-accent-lime">
          {data.activeVisitors}
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-white/40 block">pageviews</span>
          <span className="text-xs font-bold text-white">
            {data.recentEvents.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <span className="text-xs text-white/30 mb-2 block uppercase tracking-wider font-bold">
          Recent Activity
        </span>
        {data.recentEvents.length === 0 ? (
          <div className="text-center text-white/40 text-xs py-4">No recent activity</div>
        ) : (
          data.recentEvents.slice(0, 6).map((evt, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className="w-4 h-4 text-accent-orange shrink-0" />
                <span className="text-xs text-white/70 truncate">
                  {evt.page || '/'}
                </span>
                {evt.section && (
                  <span className="text-[10px] text-white/30 ml-1">#{evt.section}</span>
                )}
              </div>
              <span className="text-[10px] text-white/40 font-mono shrink-0">
                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
