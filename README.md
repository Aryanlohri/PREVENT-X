# PREVENT-X

## Overview
PREVENT-X is an AI-powered healthcare platform designed to proactively monitor and manage a user's health. The system integrates a robust vital signs tracking mechanism, a medication logging system, and an intelligent chatbot equipped with a specialized NLP engine. Together, these tools deliver context-aware, highly personalized health insights and proactive recommendations.

## Features
- **AI Health Assistant Chatbot**: An intelligent, NLP-powered chatbot that analyzes health queries and provides accurate, context-aware information.
- **Vitals Monitoring**: Secure and efficient logging of vital signs, complete with powerful data visualization through a sleek dashboard.
- **Medication Management**: Keep track of current medications safely.
- **Secure Authentication**: End-to-end Google OAuth authentication ensures user data security and privacy.
- **Dynamic Frontend Dashboard**: A modern, responsive user interface built with Vite, React, and Tailwind CSS.
- **Robust Backend Infrastructure**: Fast and scalable API developed with FastAPI.

## Technical Stack
- **Frontend**: Vite, React, Tailwind CSS, TypeScript
- **Backend**: Python, FastAPI, Machine Learning (Scikit-Learn)
- **Database**: SQLite
- **Deployment**: Docker Support

## Getting Started

### Prerequisites
- Node.js
- Python 3.10+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aryanlohri/PREVENT-X.git
   cd PREVENT-X
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## Contributing
We welcome contributions to making healthcare more proactive and accessible. Please adhere to the project's code formatting standards and write clear commit messages.

## License
MIT License
