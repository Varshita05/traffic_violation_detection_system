import cv2
import base64 
import threading
import os
import urllib.request

from detection import detect_vehicles
from queue import Queue
from database.connection_pool import get_db_connection


VIDEO_PATH = "data/traffic.mp4"
VIDEO_URL = "https://drive.google.com/file/d/1bRDgldrsv7uq0mT-f8gvbt9MqrYZ2R1q/view?usp=sharing"

os.makedirs("data", exist_ok=True)

if not os.path.exists(VIDEO_PATH):
    print("Downloading video...")
    urllib.request.urlretrieve(VIDEO_URL, VIDEO_PATH)

fps = 30
speed_limit = 60

detect_enabled = False
track_time = {}
violation_queue = Queue()
violated_vehicles = set()
seen_vehicles = set()
violation_count = 0
violation_log = []

def db_work():
    while True:
        data = violation_queue.get()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """INSERT INTO violations 
            (vehicle_type, vehicle_number, violation_type, confidence, image_path, timestamp, status)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)"""
            cursor.execute(query, params=(
                    data["vehicle_type"],
                    data["vehicle_number"],
                    data["violation_type"],
                    data["confidence"],
                    data["image_path"],
                    "Pending"
                ))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print("DB Insert Error:", e)
        finally:
            violation_queue.task_done()

def start_video(socketio):
    def video_loop():
        global violation_count, speed_limit, fps

        cap = cv2.VideoCapture(VIDEO_PATH)
        if not cap.isOpened():
            print("Error opening video file")
            return

        while True:
            ret, frame = cap.read()
            
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                track_time.clear()
                seen_vehicles.clear()
                violated_vehicles.clear()
                violation_log.clear()
                violation_count = 0
                continue

            frame = cv2.resize(frame, (640, 480))

            violations = []

            if detect_enabled:
                frame, violations, vehicle_ids = detect_vehicles(
                    frame, track_time, 
                    seen_vehicles, violated_vehicles, violation_log, 
                    speed_limit, fps, 
                )

                for violation in violations:
                    violation_queue.put(violation)

                seen_vehicles.update(vehicle_ids)
                violation_count += len(violations)
                violation_log.extend(violations)

            # Encode frame
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')

            # Emit data
            socketio.emit('video_frame', frame_base64)
            socketio.emit("stats", {
                "detection": detect_enabled,
                "vehicle_count": len(seen_vehicles),
                "violation_count": violation_count,
                "speed_limit": speed_limit,
                "camera_fps": fps
            })

            if detect_enabled:
                socketio.emit('violations', violation_log[-5:])

            socketio.sleep(1 / fps)

    threading.Thread(target=video_loop, daemon=True).start()
    threading.Thread(target=db_work, daemon=True).start()


# SOCKET EVENTS
def register_socketio_events(socketio):

    @socketio.on("start_detection")
    def start_detection():
        global detect_enabled
        detect_enabled = True
        track_time.clear()
        seen_vehicles.clear()
        violated_vehicles.clear()
        violation_log.clear()

    @socketio.on("stop_detection")
    def stop_detection():
        global detect_enabled
        detect_enabled = False

    @socketio.on("update_settings")
    def update_settings(data):
        global speed_limit, fps

        try:
            if "speedLimit" in data:
                speed_limit = int(data["speedLimit"])

            if "cameraFPS" in data:
                fps = int(data["cameraFPS"])

        except Exception as e:
            print("Error updating settings:", e)