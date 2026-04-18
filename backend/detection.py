import time
import cv2
from ultralytics import YOLO
import os
import gdown

MODEL_PATH = "models/yolov11n.pt"
MODEL_URL = "https://drive.google.com/file/d/1Rr5nFzbs81p4UNPBqBpZsK7Gq7fH1S9Q/view?usp=sharing"

os.makedirs("models", exist_ok=True)

if not os.path.exists(MODEL_PATH):
    print("Downloading model...")
    gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

vehicle_model = YOLO(MODEL_PATH)

speed_limit = 30
pixel_distance = 0.05
fps = 30
violated_vehicles = set()

def calculate_speed(vid, cy, track_time):
    now = time.time()
    if vid not in track_time:
        track_time[vid] = (cy, now)
        return 0
    prev_cy, prev_time = track_time[vid]
    if abs(cy - prev_cy) < 5:
        return 0
    distance = abs(cy - prev_cy) * pixel_distance
    time_diff = now - prev_time
    track_time[vid] = (cy, now)

    if time_diff < 0.1:
        return 0
    return (distance / time_diff) * 3.6

def detect_vehicles(frame, track_time, seen_vehicles, violated_vehicles, violation_log, speed_limit, fps):
    violations = []
    current_ids = set()

    results = vehicle_model.track(frame, persist=True, stream=False, conf=0.8)[0]
    
    if results.boxes is None or results.boxes.id is None:
        return frame, [], []
    
    boxes = results.boxes.xyxy.cpu().numpy() if results.boxes.xyxy is not None else []
    confs = results.boxes.conf.cpu().numpy() if results.boxes.conf is not None else []
    clss = results.boxes.cls.cpu().numpy() if results.boxes.cls is not None else []
    ids = results.boxes.id.cpu().numpy() if results.boxes.id is not None else []

    for box, conf, cls, vid in zip(boxes, confs, clss, ids):
        vid = int(vid) if vid is not None else None

        x1, y1, x2, y2 = map(int, box)
        cy = (y1 + y2) // 2
        speed = calculate_speed(vid, cy, track_time)
        violation = speed > speed_limit
        color = (0, 0, 255) if violation else (0, 255, 0)
        label = vehicle_model.names[int(cls)] if cls is not None else "Unknown"
        
        # detection on frame
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            frame, 
            f"{label} ID:{vid} {speed:.1f} km/h {conf:.2f}",
            (x1, y1 - 10), 
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5, 
            color, 
            2
        )

        if violation and vid not in violated_vehicles:
            violated_vehicles.add(vid)

            plate_number = f"PLATE{vid:04d}"
            
            violations.append({
                "vehicle_type": label,
                "vehicle_number": plate_number,
                "violation_type": "Over Speeding",
                "confidence": float(conf),
                "speed": round(speed, 2),
                "image_path": f"violations/violation_{int(time.time())}_{vid}.jpg",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        current_ids.add(vid)
        seen_vehicles.add(vid)
        
    return frame, violations, current_ids

