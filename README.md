# 🛡️ SentinelAI

<p align="center">
  <img src="https://img.shields.io/badge/AI-Cybersecurity-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-FullStack-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/ESP32-IoT-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

<h3 align="center">
AI-Powered Real-Time Scam Call Detection & Cyber Threat Intelligence Platform
</h3>

---

# 📌 Overview

SentinelAI is an advanced AI-powered cybersecurity platform designed to detect scam calls, fraudulent communication patterns, and cyber threats in real-time using Artificial Intelligence, Voice Intelligence, Fraud Analysis Engines, and IoT Hardware Integration.

The system continuously analyzes conversations, identifies scam indicators, evaluates fraud risk scores, and instantly alerts users through both software and hardware-based warning systems.

SentinelAI combines:

* 🎙️ Real-time Voice AI
* 🧠 AI Fraud Intelligence
* 📊 Risk Analysis Engine
* 🔌 ESP32 Hardware Alert System
* 🌍 Threat Intelligence Visualization
* 📋 Cybercrime Reporting
* 🛡️ Multilingual Scam Detection
* 🤖 AI-Powered Scam Classification
* 🧩 Hybrid AI + Rule-Based Security Architecture

The goal of SentinelAI is to create a proactive cyber defense assistant capable of preventing financial fraud before users become victims.

---

# 🚨 Problem Statement

Phone scams, phishing attacks, fake bank calls, OTP frauds, UPI scams, impersonation attacks, and cyber fraud are rapidly increasing across the world.

Traditional spam blockers only identify known numbers and fail to:

* Detect scam conversations in real-time
* Understand regional languages
* Analyze live voice interactions
* Detect unknown scam patterns
* Provide immediate actionable alerts
* Integrate physical warning systems

Millions of users lose money every year because existing systems react too late.

SentinelAI solves this problem by using AI-driven live fraud analysis combined with hardware alert systems to stop scams before damage occurs.

---

# 🎯 Key Features

## 🎙️ Real-Time Voice Scam Detection

* Live speech recognition
* Real-time transcript generation
* AI-powered voice analysis
* Detects scam indicators during conversations
* Supports multilingual voice processing

---

## 🌐 Multilingual AI Support

Supports:

* English
* Tamil
* Hindi
* Telugu
* Malayalam
* Kannada

Features:

* Multilingual speech recognition
* Localized AI responses
* Regional language scam detection
* Multilingual voice synthesis
* Native pronunciation support

---

## 🧠 AI Fraud Detection Engine

Hybrid fraud intelligence system combining:

* AI-based contextual analysis
* Rule-based pattern matching
* Threat scoring algorithms
* Behavioral analysis
* Fraud classification engine

---

## ⚡ Real-Time Risk Scoring

The system calculates dynamic fraud scores from:

* Voice content
* Scam keywords
* Urgency indicators
* Financial requests
* Identity theft attempts
* AI confidence levels

### Risk Levels

| Score  | Risk Level       |
| ------ | ---------------- |
| 0–30   | 🟢 Low Risk      |
| 31–60  | 🟡 Medium Risk   |
| 61–80  | 🔴 High Risk     |
| 81–100 | 🚨 Critical Risk |

---

# 🧩 Fraud Categories Detected

SentinelAI can detect:

* Bank OTP Scams
* UPI Payment Frauds
* Fake Delivery Scams
* Credit Card Frauds
* Lottery Scams
* Tech Support Scams
* Authority Impersonation
* Identity Theft Attempts
* KYC Verification Scams
* Password Theft Attempts
* Personal Data Collection Attacks
* Emergency/Urgency Pressure Tactics

---

# 🔍 Fraud Detection Indicators

The system identifies:

* OTP requests
* Password requests
* Banking keywords
* Account blocking threats
* Urgent language
* Payment requests
* Credit card numbers
* CVV requests
* Suspicious links
* Fake support calls
* Threatening behavior
* Authority impersonation

---

# 🤖 AI Intelligence Architecture

SentinelAI uses a hybrid AI architecture.

## AI Providers

* Gemini AI
* Groq AI
* Local Rule Engine

## AI Responsibilities

* Scam classification
* Context understanding
* Behavioral analysis
* Threat scoring
* Fraud explanation
* Confidence evaluation
* Risk reasoning

---

# ⚙️ Hybrid Detection Pipeline

```text
Voice Input
     ↓
Speech Recognition
     ↓
Live Transcript
     ↓
Fraud Rule Engine
     ↓
AI Analysis (Gemini/Groq)
     ↓
Combined Risk Scoring
     ↓
Threat Classification
     ↓
Hardware Alert Trigger
     ↓
Cybercrime Reporting
```

---

# 🔌 ESP32 Hardware Integration

SentinelAI integrates with ESP32 hardware for physical cyber alerts.

## Hardware Components

* ESP32 Microcontroller
* Buzzer
* Green LED
* Yellow LED
* Red LED
* Emergency Stop Button

---

# 🚦 Hardware Alert System

## 🟢 Low Risk

* Green LED ON
* Safe communication

## 🟡 Medium Risk

* Yellow LED ON
* Suspicious communication

## 🔴 High Risk

* Red LED ON
* Fraud warning

## 🚨 Critical Risk

* Red LED ON
* Buzzer Activated
* Emergency Alert Triggered

---

# 🔄 Real-Time Hardware Communication

SentinelAI sends HTTP requests directly to the ESP32.

Example:

```javascript
fetch(`http://ESP32_IP/risk?value=${riskScore}`)
```

The ESP32 instantly updates:

* LED indicators
* Buzzer alerts
* Emergency warnings

---

# 🗺️ Threat Intelligence Map

Features:

* Geographic fraud visualization
* Threat cluster analysis
* Scam hotspot monitoring
* Region-based scam tracking
* Interactive threat mapping

---

# 📋 Cybercrime Report Generator

Automatically generates:

* Scam evidence reports
* Fraud analysis summaries
* Conversation transcripts
* Risk assessments
* Cyber complaint documentation

---

# 🏆 Gamification System

Features:

* User safety scores
* Cyber awareness achievements
* Protection streaks
* Threat response tracking
* User engagement system

---

# 🧠 AI Voice Assistant

The SentinelAI Voice Assistant:

* Listens to conversations
* Detects scam indicators
* Speaks warnings using AI-generated voice
* Supports multilingual speech
* Provides live protection feedback

---

# 🎤 AI Voice Technology

## Text-to-Speech

Powered using:

* ElevenLabs API

Features:

* Human-like AI voice
* Multilingual voice generation
* Natural speech synthesis
* Realistic AI assistant interaction

---

# 🔍 Speech Recognition

Uses browser speech recognition APIs with:

* Language-specific recognition
* Dynamic language switching
* Real-time transcription
* Continuous speech processing

---

# 📚 Tech Stack

## Frontend

* Next.js 14
* React.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Spline 3D

---

## Backend

* Next.js API Routes
* Serverless Architecture
* Node.js Runtime

---

## AI & Machine Learning

* Gemini API
* Groq API
* AI Prompt Engineering
* NLP-Based Fraud Analysis
* Hybrid Scoring Algorithms

---

## Voice AI

* ElevenLabs API
* Web Speech API
* Browser Speech Recognition
* AI Voice Synthesis

---

## Database & Authentication

* Firebase Authentication
* Firebase Firestore
* Firebase Storage

---

## Hardware & IoT

* ESP32
* Arduino IDE
* HTTP Communication
* IoT Alert System

---

## Deployment

* Vercel
* GitHub

---

# 🏗️ System Architecture

```text
┌──────────────────────┐
│      User Voice      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Speech Recognition   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Live Transcript     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Fraud Rule Engine    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ AI Fraud Analysis    │
│ Gemini + Groq AI     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Combined Risk Score  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Threat Classification│
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ ESP32 Hardware Alert │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Cybercrime Reports   │
└──────────────────────┘
```

---

# 📂 Project Structure

```bash
SentinelAI/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── voice-assistant/
│   ├── fraud-intelligence/
│   ├── threat-map/
│   ├── cyber-report/
│   └── gamification/
│
├── components/
├── lib/
│   ├── fraud-engine.ts
│   ├── ai-analysis.ts
│   ├── speech.ts
│   └── firebase.ts
│
├── public/
├── styles/
├── hardware/
├── README.md
└── package.json
```

---

# 🔐 Security Features

* Real-time fraud analysis
* AI-based threat classification
* Multilingual scam identification
* Hardware-level alerts
* Suspicious keyword detection
* Dynamic threat scoring
* Identity theft detection
* Fraud intelligence monitoring

---

# 📱 Mobile Responsiveness

SentinelAI is fully optimized for:

* Desktop
* Mobile devices
* Tablets
* Responsive layouts
* Portrait & landscape modes

---

# 🎨 UI/UX Features

* Futuristic cybersecurity UI
* Glassmorphism design
* 3D Spline integration
* AI-themed animations
* Responsive dashboard layouts
* Real-time indicators
* Animated threat visualizations

---

# ⚡ Performance Optimizations

* Serverless backend architecture
* Dynamic imports
* Optimized rendering
* Responsive Spline loading
* Mobile-friendly layouts
* Efficient API handling

---

# 🚀 Deployment Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/sentinelai.git
cd sentinelai
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GEMINI_API_KEY=
GROQ_API_KEY=
ELEVENLABS_API_KEY=
```

---

## 4️⃣ Run Development Server

```bash
npm run dev
```

---

## 5️⃣ Deploy to Vercel

```bash
vercel
```

---

# 🔌 ESP32 Setup

## Required Components

* ESP32
* LEDs
* Buzzer
* Breadboard
* Resistors
* Jumper Wires

---

## Hardware Pin Connections

| Component  | ESP32 Pin |
| ---------- | --------- |
| Green LED  | GPIO23    |
| Yellow LED | GPIO18    |
| Red LED    | GPIO19    |
| Buzzer     | GPIO21    |
| Button     | GPIO4     |

---

# 🧪 Testing

## Scam Detection Testing

Test using phrases like:

```text
Your bank account will be blocked.
Share your OTP immediately.
Please provide your card number and CVV.
```

Expected Result:

* High risk score
* Red LED activation
* Buzzer alert
* AI scam classification

---

# 📈 Future Scope

Future enhancements include:

* AI behavioral biometrics
* Multi-model AI orchestration
* Real-time call interception
* Edge AI deployment
* MLOps pipeline integration
* Kubernetes deployment
* Multi-agent AI system
* Blockchain evidence logging
* Wearable device integration
* Smartwatch cyber alerts
* Advanced RAG pipelines
* Threat intelligence APIs
* Federated AI learning

---

# 🧠 Advanced Concepts Used

* Artificial Intelligence
* Natural Language Processing
* Cybersecurity Intelligence
* Real-Time Fraud Detection
* IoT Integration
* Voice AI
* Threat Intelligence
* Hybrid AI Systems
* Serverless Architecture
* Responsive Web Design

---

# 🏆 Hackathon Project

Built during:

## 🚀 AI-Nexus'26 Hackathon

---

# 👨‍💻 Team Code-a-Holics

## Team Members

* Balashanmugam S
* Swarnika S
* Yogeshwar S

---

# 🌟 Vision

SentinelAI aims to become a next-generation AI cybersecurity assistant capable of protecting users from digital fraud in real-time through intelligent voice analysis, proactive threat detection, and hardware-integrated alert systems.

Our vision is to make cybersecurity accessible, intelligent, multilingual, and proactive for everyone.

---

# 🤝 Contributing

Contributions are welcome.

Feel free to:

* Fork the repository
* Create feature branches
* Submit pull requests
* Improve AI detection
* Add new scam patterns
* Enhance UI/UX
* Expand language support

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork the project
📢 Share with others

---

# 📬 Contact

## Balashanmugam S

* LinkedIn: [https://www.linkedin.com/in/balashanmugams](https://www.linkedin.com/in/balashanmugams)
* Email: [balashanmugams.07@gmail.com](mailto:balashanmugams.07@gmail.com)

---

<p align="center">
  <b>🛡️ SentinelAI — Intelligent Cyber Defense for the Future</b>
</p>
