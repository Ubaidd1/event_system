import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Calendar, Heart } from 'lucide-react';
import { authService } from '../../services/authService';

const Header = ({ title = 'Wedding Dashboard', onRefresh }) => {
  const [seeding, setSeeding] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  const weddingTargetDate = new Date('2027-03-19T18:00:00.000Z');

  useEffect(() => {
    const updateTimer = () => {
      const diff = weddingTargetDate.getTime() - new Date().getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        setCountdown({ days, hours, mins });
      }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSeedDemo = async () => {
    if (!window.confirm('Reset & Seed database with demo data (Abdullah & Sarah Wedding)?')) return;
    setSeeding(true);
    try {
      await authService.seedDemo();
      if (onRefresh) onRefresh();
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="bg-charcoal-900/80 backdrop-blur-md border-b border-amber-500/10 px-6 py-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Wedding Banner */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide">{title}</h2>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-gold-300 border border-amber-500/20">
              <Heart className="w-3 h-3 text-rose-400 fill-current" />
              <span>Abdullah & Sarah</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Wedding Celebration • 19 March 2027</p>
        </div>
      </div>

      {/* Countdown Widget & Action */}
      <div className="flex items-center space-x-3">
        {/* Countdown Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 glass-card rounded-xl border border-amber-500/20 text-xs font-medium">
          <Calendar className="w-4 h-4 text-gold-400" />
          <span className="text-gray-400">Countdown:</span>
          <span className="font-bold text-gold-300 font-mono">
            {countdown.days}d {countdown.hours}h {countdown.mins}m
          </span>
        </div>

        {/* Reset & Seed Demo Data button */}
        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-gold-300 rounded-xl border border-amber-500/30 transition-all shadow-sm"
          title="Reset database with realistic demo data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
