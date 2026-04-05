# AI-Powered Vision System for Traffic Violation Detection 🚦

## Overview

This project implements an **AI-based computer vision system** to automatically detect traffic violations using **CCTV/RTSP video feeds**. The system applies deep learning–based object detection, tracking, and optical character recognition to identify violations such as helmet absence, overspeeding, triple riding, and license plate extraction.

> ⚠️ **Note:** This project is currently **under active development**. Features, models, and results are subject to change.

---

## Key Features

* Real-time video processing from CCTV / RTSP feeds
* Vehicle and rider detection using **YOLO-based object detection**
* Multi-object tracking with **Deep SORT**
* Speed estimation from tracked objects
* Traffic rule evaluation and violation identification
* License plate recognition using **EasyOCR**
* Violation data storage in **MySQL**
* Web-based visualization using **React dashboard**

---

## System Workflow

1. Video input from CCTV / RTSP stream
2. Frame extraction and preprocessing
3. Object detection (vehicles, riders, helmets)
4. Object tracking and speed estimation
5. Traffic rule evaluation
6. Violation detection
7. License plate recognition
8. Data storage and dashboard display

---

## Dataset

This project uses an **external traffic surveillance dataset** for training and evaluation.

---

## Technologies Used

* Python
* YOLO (Object Detection)
* Deep SORT (Tracking)
* EasyOCR (License Plate Recognition)
* Flask (Backend API)
* MySQL (Database)
* React (Frontend Dashboard)

---

## Current Status

* Core detection and tracking pipeline implemented
* Violation logic under refinement
* Dataset expansion and fine-tuning in progress
* Performance evaluation ongoing
* Frontend working

🚧 **This is a research-oriented prototype and not yet production-ready.**

---

## Future Work

* Improve detection accuracy under low-light conditions
* Expand violation categories
* Optimize real-time performance
* Deploy as a scalable cloud-based system

---

## Disclaimer

This project is developed **strictly for academic and research purposes**. It is not intended for direct deployment in live traffic enforcement without regulatory approval.

---

