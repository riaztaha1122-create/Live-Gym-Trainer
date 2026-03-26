import React, { useEffect, useState } from 'react';
import { Award, Trophy, RefreshCcw, Home, Star } from 'lucide-react';

const CompletionScreen = ({ exercise, count, onRestart, onHome }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const exerciseName = exercise === 'squat' ? 'Squats' : 'Bicep Curls';

  return (
    <div className="completion-container">
      <div className="celebration-icon">
        <Trophy size={80} color="#4facfe" />
        <div className="glow-effect" />
      </div>

      <div className="completion-header">
        <h1>Mission Accomplished!</h1>
        <p>Outstanding performance! You've successfully completed your {exerciseName} session.</p>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <span className="summary-label">Total Reps</span>
          <span className="summary-value">{count}</span>
        </div>
        <div className="summary-card highlight-card">
          <span className="summary-label">Form Accuracy</span>
          <span className="summary-value">98%</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill="#4facfe" color="#4facfe" />
            ))}
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-label">Calories Burned</span>
          <span className="summary-value">{Math.round(count * 0.5)} kcal</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={onHome}>
          <Home size={20} />
          Back to Selection
        </button>
        <button className="btn-primary" onClick={onRestart}>
          <RefreshCcw size={20} />
          Challenge Again
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;
