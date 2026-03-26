import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Activity, Camera as CameraIcon, Info, RefreshCcw } from 'lucide-react';
import '../index.css';

const Camera = ({ exercise, onFeedback, onFinish, onExit, targetReps = 10 }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const requestRef = useRef();
  const [currentCount, setCurrentCount] = useState(0);

  // Initialize WebSocket
  useEffect(() => {
    setCurrentCount(0);
    ws.current = new WebSocket('ws://localhost:8001/ws');
    
    ws.current.onopen = () => {
      console.log('Connected to Backend');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.landmarks) {
        setLandmarks(data.landmarks);
      }
      if (data.count !== undefined) {
        setCurrentCount(data.count);
        if (data.count >= targetReps) {
          onFinish();
        }
      }
      onFeedback(data);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from Backend');
      setIsConnected(false);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [onFeedback, onFinish, targetReps]);

  // Send reset signal on mount
  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'reset' }));
    } else {
      // If not open yet, wait for open and then send
      const checkAndReset = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'reset' }));
        } else {
          setTimeout(checkAndReset, 100);
        }
      };
      checkAndReset();
    }
  }, []);

  // Handle frame transmission
  const capture = useCallback(() => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        ws.current.send(JSON.stringify({
          frame: imageSrc,
          exercise: exercise
        }));
      }
    }
  }, [exercise]);

  // Animation loop
  const animate = useCallback(() => {
    capture();
    requestRef.current = requestAnimationFrame(animate);
  }, [capture]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Draw landmarks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width || 1280;
    const height = canvas.height || 720;
    ctx.clearRect(0, 0, width, height);
    
    // TEST DOT: Always draw a dot in the corner to verify canvas is active
    ctx.fillStyle = "rgba(0, 242, 254, 0.5)";
    ctx.beginPath();
    ctx.arc(20, 20, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Draw points
    ctx.fillStyle = "#00f2fe";
    landmarks.forEach(lm => {
      const x = lm.x * width;
      const y = lm.y * height;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections
    ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f2fe";
    
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [24, 26], [25, 27], [26, 28] // Legs
    ];
    
    connections.forEach(([i, j]) => {
      const p1 = landmarks.find(l => l.id === i);
      const p2 = landmarks.find(l => l.id === j);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }, [landmarks]);

  return (
    <div className="camera-section">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
        onUserMedia={(stream) => {
          const settings = stream.getVideoTracks()[0].getSettings();
          if (canvasRef.current) {
            canvasRef.current.width = settings.width;
            canvasRef.current.height = settings.height;
          }
        }}
      />
      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        width={1280}
        height={720}
      />
      
      {/* Dynamic Feedback Overlay */}
      <div className="live-feedback-overlay">
        <div className="feedback-badge">
          <Activity size={20} className="pulse-icon" />
          <span>{exercise.toUpperCase()} MODE</span>
        </div>
        <h2 className="live-feedback-text">{landmarks.length > 0 ? onFeedback?.feedback || 'Ready!' : 'Aligning...'}</h2>
      </div>
      
      <div className="control-bar">
        <div className={`status-dot ${isConnected ? 'active' : ''}`} />
        <span>{isConnected ? 'Tracking Active' : 'Connecting to AI...'}</span>
        <button 
          onClick={onExit}
          style={{ 
            background: 'rgba(255, 75, 43, 0.1)', 
            border: '1px solid rgba(255, 75, 43, 0.3)', 
            color: '#ff4b2b', 
            fontWeight: '800', 
            cursor: 'pointer',
            marginLeft: '1.5rem',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 75, 43, 0.2)';
            e.currentTarget.style.borderColor = '#ff4b2b';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 75, 43, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 75, 43, 0.3)';
          }}
        >
          EXIT WORKOUT
        </button>
      </div>
    </div>
  );
};

export default Camera;
