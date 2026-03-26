import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import base64
import json
import os
import urllib.request

class PoseDetector:
    def __init__(self, detector=None, session_id="default"):
        self.session_id = session_id
        if detector:
            self.detector = detector
        else:
            # Download model if not exists
            model_path = 'pose_landmarker_lite.task'
            if not os.path.exists(model_path):
                print("Downloading model...")
                url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
                urllib.request.urlretrieve(url, model_path)
            
            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.PoseLandmarkerOptions(
                base_options=base_options,
                output_segmentation_masks=False,
                running_mode=vision.RunningMode.IMAGE
            )
            self.detector = vision.PoseLandmarker.create_from_options(options)
        
        self.count = 0
        self.dir = 0
        self.feedback = "Get Ready!"
        self.current_exercise = None
        self.min_y = 1.0 # Track highest point (smallest y value)

    def reset(self):
        self.count = 0
        self.dir = 0
        self.feedback = "Get Ready!"
        self.min_y = 1.0

    def find_angle(self, p1, p2, p3, landmarks, w, h):
        # Get coordinates
        x1, y1 = landmarks[p1].x * w, landmarks[p1].y * h
        x2, y2 = landmarks[p2].x * w, landmarks[p2].y * h
        x3, y3 = landmarks[p3].x * w, landmarks[p3].y * h

        # Calculate angle
        angle = np.degrees(np.arctan2(y3 - y2, x3 - x2) - np.arctan2(y1 - y2, x1 - x2))
        if angle < 0:
            angle += 360
        if angle > 180:
            angle = 360 - angle
        return angle

    def process_frame(self, frame_base64, exercise="squat"):
        # Auto-reset if exercise changes
        if exercise != self.current_exercise:
            self.reset()
            self.current_exercise = exercise

        # Decode base64
        try:
            encoded_data = frame_base64.split(',')[1]
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            return {"error": f"Decoding error: {e}"}
        
        if img is None:
            return {"error": "Invalid frame"}

        h, w, c = img.shape
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        detection_result = self.detector.detect(mp_image)
        
        response = {
            "count": self.count,
            "feedback": self.feedback,
            "landmarks": [],
            "session_id": self.session_id
        }

        if detection_result.pose_landmarks:
            landmarks = detection_result.pose_landmarks[0]
            
            # Exercise Logic (High-Response V11)
            if exercise == "squat":
                val = landmarks[0].y # Nose
                if val < self.min_y: self.min_y = val
                diff = val - self.min_y
                per = np.interp(diff, (0.02, 0.10), (0, 100))
                
                if per >= 95 and self.dir == 0:
                    self.count += 0.5
                    self.dir = 1
                elif per <= 5 and self.dir == 1:
                    self.count += 0.5
                    self.dir = 0
                
                if self.dir == 1: self.feedback = "Stand Up!"
                else: self.feedback = "Go Down"

            elif exercise == "pushup":
                val = (landmarks[11].y + landmarks[12].y) / 2 # Shoulders
                if val < self.min_y: self.min_y = val
                diff = val - self.min_y
                per = np.interp(diff, (0.015, 0.07), (0, 100))
                
                if per >= 95 and self.dir == 0:
                    self.count += 0.5
                    self.dir = 1
                elif per <= 5 and self.dir == 1:
                    self.count += 0.5
                    self.dir = 0
                
                if self.dir == 1: self.feedback = "Push Up!"
                else: self.feedback = "Lower Down"

            elif exercise == "lunge":
                val = (landmarks[11].y + landmarks[12].y) / 2 # Shoulders
                if val < self.min_y: self.min_y = val
                diff = val - self.min_y
                per = np.interp(diff, (0.015, 0.05), (0, 100)) # More sensitive thresholds for lunges
                
                if per >= 95 and self.dir == 0:
                    self.count += 0.5
                    self.dir = 1
                elif per <= 5 and self.dir == 1:
                    self.count += 0.5
                    self.dir = 0
                
                if self.dir == 1: self.feedback = "Stand Up"
                else: self.feedback = "Lunge Down"

            elif exercise == "jumping_jack":
                hand_y = (landmarks[15].y + landmarks[16].y) / 2
                sh_y = (landmarks[11].y + landmarks[12].y) / 2
                # Hands relative to shoulders displacement
                diff = sh_y - hand_y
                per = np.interp(diff, (0.02, 0.12), (0, 100))
                
                if per >= 95 and self.dir == 0:
                    self.count += 0.5
                    self.dir = 1
                elif per <= 5 and self.dir == 1:
                    self.count += 0.5
                    self.dir = 0
                
                if self.dir == 1: self.feedback = "Hands Down"
                else: self.feedback = "Jump Out!"

            response["count"] = int(self.count)
            response["feedback"] = self.feedback
            
            # Prepare landmarks for UI
            for i, lm in enumerate(landmarks):
                response["landmarks"].append({
                    "id": int(i),
                    "x": float(lm.x),
                    "y": float(lm.y)
                })

        return response
