import React, { useState } from 'react';
import Camera from './components/Camera';
import SelectionScreen from './components/SelectionScreen';
import CompletionScreen from './components/CompletionScreen';
import { Activity, Dumbbell, Award, HelpCircle, ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [view, setView] = useState('selection'); // 'selection' | 'workout' | 'completion'
  const [exercise, setExercise] = useState('squat');
  const [feedback, setFeedback] = useState({
    count: 0,
    feedback: "Get Ready!",
    is_correct: true
  });
  const [targetReps, setTargetReps] = useState(10);
  const [sessionKey, setSessionKey] = useState(0);

  const handleSelectExercise = (type) => {
    setExercise(type);
    setFeedback({ count: 0, feedback: "Get Ready!", is_correct: true });
    setSessionKey(prev => prev + 1);
    setView('workout');
  };

  const handleFeedback = (data) => {
    setFeedback(data);
  };

  const handleFinish = () => {
    setView('completion');
  };

  const handleRestart = () => {
    setFeedback({ count: 0, feedback: "Get Ready!", is_correct: true });
    setView('workout');
  };

  const handleGoHome = () => {
    setView('selection');
  };

  const handleExit = () => {
    setView('selection');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
          <Activity size={32} />
          <span>AI GYM TRAINER</span>
        </div>
        {view === 'workout' && (
          <button className="btn-back" onClick={handleGoHome}>
            <ArrowLeft size={18} />
            Exit Workout
          </button>
        )}
      </header>

      <main className="main-content">
        {view === 'selection' && (
          <SelectionScreen onSelect={handleSelectExercise} />
        )}

        {view === 'workout' && (
          <>
            <div className="camera-section">
              <Camera 
                key={sessionKey}
                exercise={exercise} 
                onFeedback={handleFeedback} 
                onFinish={handleFinish}
                onExit={handleExit}
                targetReps={targetReps}
              />
            </div>

            <aside className="stats-section">
              <div className="stat-card">
                <span className="stat-label">Repetitions</span>
                <span className="stat-value">{feedback.count} / {targetReps}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(feedback.count / targetReps) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="feedback-card">
                <div className="pulse-indicator">
                  <Award size={48} color="#4facfe" />
                </div>
                <h2 className="feedback-text">{feedback.feedback}</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Maintain your form for accurate counting.
                </p>
              </div>

              <div className="stat-card" style={{ flex: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <HelpCircle size={20} color="rgba(255,255,255,0.4)" />
                  <span className="stat-label">
                    Exercise: {exercise === 'squat' ? 'Squats' : 'Bicep Curls'}
                  </span>
                </div>
              </div>
            </aside>
          </>
        )}

        {view === 'completion' && (
          <CompletionScreen 
            exercise={exercise} 
            count={feedback.count} 
            onRestart={handleRestart}
            onHome={handleGoHome}
          />
        )}
      </main>

      <style jsx>{`
        .btn-back {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-back:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-top: 1rem;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f2fe, #4facfe);
          transition: width 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
