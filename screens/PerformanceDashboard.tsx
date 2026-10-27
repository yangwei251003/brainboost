
import React, { useMemo } from 'react';
import { getSessionHistory, getRecord } from '../services/storageService';
import { GAMES } from '../constants';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Clock, 
  Award, 
  Calendar,
  BrainCircuit,
  Zap,
  ChevronRight
} from 'lucide-react';
import { SessionRecord } from '../types';

const PerformanceDashboard: React.FC = () => {
  const history = useMemo(() => getSessionHistory(), []);
  
  const stats = useMemo(() => {
    const totalSessions = history.length;
    const totalScore = history.reduce((acc, s) => acc + s.score, 0);
    const avgScore = totalSessions ? Math.round(totalScore / totalSessions) : 0;
    
    // Group by game
    const gameStats = GAMES.map(game => {
      const gameHistory = history.filter(h => h.gameId === game.id);
      const record = getRecord(game.id);
      const avgGameScore = gameHistory.length 
        ? Math.round(gameHistory.reduce((acc, s) => acc + s.score, 0) / gameHistory.length) 
        : 0;
      
      return {
        ...game,
        count: gameHistory.length,
        avgScore: avgGameScore,
        record
      };
    });

    // Activity trend (last 7 entries)
    const trend = history.slice(-7).map(s => s.score);

    return { totalSessions, totalScore, avgScore, gameStats, trend };
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-scifi-bg overflow-y-auto p-4 md:p-6 pb-24 space-y-6">
      <div className="flex flex-col mb-2">
        <h2 className="text-3xl font-display font-bold text-white tracking-tighter">游戏表现记录</h2>
        <p className="text-scifi-muted font-mono text-xs uppercase tracking-widest">Local Game Session Analytics</p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '训练总场次', value: stats.totalSessions, icon: Activity, color: 'text-scifi-primary' },
          { label: '平均游戏得分', value: `${stats.avgScore}`, icon: Zap, color: 'text-scifi-success' },
          { label: '最高分记录', value: Math.max(...GAMES.map(g => getRecord(g.id).highScore)), icon: Award, color: 'text-scifi-accent' },
          { label: '体验过的模块', value: stats.gameStats.filter(g => g.count > 0).length, icon: BrainCircuit, color: 'text-scifi-secondary' },
        ].map((item, idx) => (
          <div key={idx} className="bg-scifi-card border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-scifi-primary/20 transition-all">
            <div className={`p-2 rounded-lg bg-white/5 w-fit mb-4 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-white">{item.value}</div>
              <div className="text-[10px] text-scifi-muted uppercase font-mono tracking-wider">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Trends & Radar Concept */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (CSS only visualization) */}
        <div className="lg:col-span-2 bg-scifi-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-scifi-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">近期表现趋势</h3>
            </div>
            <div className="text-[10px] text-scifi-muted font-mono uppercase tracking-widest">Last 7 Sessions</div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 px-2 relative">
             {/* Simple Bar Chart Visualization */}
             {stats.trend.length > 0 ? stats.trend.map((val, i) => {
               const height = Math.max(10, (val / Math.max(...stats.trend, 1)) * 100);
               return (
                 <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-scifi-primary/20 group-hover:bg-scifi-primary/40 rounded-t-md transition-all duration-500 ease-out"
                      style={{ height: `${height}%` }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-t from-transparent to-scifi-primary/10 opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <div className="mt-2 text-[8px] font-mono text-scifi-muted">ENTRY_{i+1}</div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-xl whitespace-nowrap">
                         Score: {val}
                       </div>
                    </div>
                 </div>
               );
             }) : (
               <div className="absolute inset-0 flex items-center justify-center text-scifi-muted font-mono text-xs uppercase tracking-tighter italic">
                  数据不足。请继续训练...
               </div>
             )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-scifi-card border border-white/5 rounded-3xl p-6">
           <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">模块得分概览</h3>
           <div className="space-y-4">
              {stats.gameStats.slice(0, 4).map((game, i) => {
                const percentage = Math.min(100, (game.avgScore / 500) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono uppercase">
                      <span className="text-scifi-muted">{game.title.split(' ')[0]}</span>
                      <span className="text-white">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className={`h-full ${game.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}
                        style={{ width: `${percentage}%` }}
                       ></div>
                    </div>
                  </div>
                );
              })}
           </div>
           <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-scifi-muted leading-relaxed">
                仅汇总本浏览器最近100次游戏记录。条形图按平均游戏分数与500分参考线展示，不表示认知能力或神经测量。
              </p>
           </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-scifi-card border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Calendar size={18} className="text-scifi-secondary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">历史交互日志</h3>
           </div>
           <button className="text-[10px] font-mono text-scifi-primary hover:underline uppercase tracking-widest">
              全部历史
           </button>
        </div>
        <div className="divide-y divide-white/5">
          {history.length > 0 ? [...history].reverse().slice(0, 5).map((session, i) => {
            const game = GAMES.find(g => g.id === session.gameId);
            return (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${game?.color || 'text-white'}`}>
                    {game ? <game.icon size={16} /> : <Zap size={16} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{game?.title || 'Unknown Protocol'}</div>
                    <div className="text-[10px] text-scifi-muted font-mono uppercase">
                      {new Date(session.timestamp).toLocaleString()} • {session.difficulty}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-scifi-primary">+{session.score}</div>
                  {session.time && <div className="text-[10px] text-scifi-muted font-mono">{session.time.toFixed(2)}s</div>}
                </div>
              </div>
            );
          }) : (
            <div className="p-10 text-center text-scifi-muted font-mono text-xs uppercase">
              暂无历史记录。初始化你的首个训练模块。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
