import React from 'react';
import { Dumbbell, Activity, User, ChevronRight } from 'lucide-react';

const SelectionScreen = ({ onSelect }) => {
  const exercises = [
    {
      id: 'squat',
      name: 'Squats',
      description: 'Lower body power. Strengthen your legs and glutes.',
      icon: <Activity size={32} color="#00f2fe" />,
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'pushup',
      name: 'Pushups',
      description: 'Upper body strength. Focus on chest and triceps.',
      icon: <Activity size={32} color="#4facfe" />,
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'lunge',
      name: 'Lunges',
      description: 'Balance and leg strength. Perfect for home workouts.',
      icon: <Activity size={32} color="#fb7185" />,
      image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'jumping_jack',
      name: 'Jumping Jacks',
      description: 'Full body cardio. Burn calories anywhere.',
      icon: <Activity size={32} color="#a855f7" />,
      image: 'https://images.unsplash.com/photo-1598136490941-30d885318abd?auto=format&fit=crop&q=80&w=400',
    }
  ];

  return (
    <div className="selection-container">
      <div className="selection-header">
        <h1>Welcome to <span className="highlight">AI Gym Trainer</span></h1>
        <p>Select an exercise to begin your professional AI-guided workout session.</p>
      </div>

      <div className="exercise-grid">
        {exercises.map((ex) => (
          <div key={ex.id} className="exercise-card" onClick={() => onSelect(ex.id)}>
            <div className="card-image">
              <img src={ex.image} alt={ex.name} />
              <div className="card-overlay" />
              <div className="card-badge">
                {ex.id === 'jumping_jack' || ex.id === 'lunge' ? 'REFINED' : 'ACTIVE'}
              </div>
            </div>
            <div className="card-content">
              <div className="card-icon">{ex.icon}</div>
              <h3>{ex.name}</h3>
              <p>{ex.description}</p>
              <button className="start-button">
                Get Started <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="selection-footer">
        <div className="user-badge">
          <User size={16} />
          <span>Professional Athlete Mode</span>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;
