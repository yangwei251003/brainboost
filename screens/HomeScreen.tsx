import React, { useEffect, useState } from 'react';
import { GAMES } from '../constants';
import GameCard from '../components/GameCard';
import { getRecord, GameRecord } from '../services/storageService';

interface HomeScreenProps {
  onGameSelect: (gameId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGameSelect }) => {
  const [records, setRecords] = useState<Record<string, GameRecord>>({});

  useEffect(() => {
    // Load records on mount
    const newRecords: Record<string, GameRecord> = {};
    GAMES.forEach(game => {
        newRecords[game.id] = getRecord(game.id);
    });
    setRecords(newRecords);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 pb-24 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl text-white font-bold mb-1">欢迎回来，指挥官。</h2>
          <p className="text-scifi-muted">选择一个小游戏开始体验。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              {...game}
              onClick={onGameSelect}
              record={records[game.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;