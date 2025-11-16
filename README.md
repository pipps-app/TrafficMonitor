# Landing Page Traffic Monitor

An interactive, single-page web application to monitor and analyze real-time visitor traffic for your landing pages. This internal tool integrates with the Gemini API to provide powerful, AI-driven insights into page performance and user engagement based on actual user data.
 
*(Note: Replace with an actual screenshot of the application's dashboard.)*

---

## ✨ Features

*   **Multi-Page Management**: Add, track, and delete multiple landing pages from a centralized interface.
*   **Unique Tracking Code**: Automatically generates a unique JavaScript tracking snippet for each new page.
*   **Real-Time Data Backend**: Designed to work with a backend that collects data from the tracking snippet.
*   **Installation Verification**: A "verification" flow to confirm that the backend has received data from the tracking script.
*   **Interactive Dashboard**: A clean, responsive dashboard displaying key web analytics metrics:
    *   Total Visitors
    *   Page Views
    *   Bounce Rate
    *   Average Session Duration
*   **Rich Data Visualization**: Utilizes `recharts` to render beautiful and informative charts for:
    *   Visitor trends over 30 days (Line Chart)
    *   Traffic source breakdown (Bar Chart)
    *   User device types (Pie Chart)
*   **Live Mode**: Toggle a "Go Live" mode to poll the backend for fresh data every few seconds, simulating a real-time view.
*   **🤖 AI-Powered Insights**: Leverages the Gemini API for deep analysis of your **real** traffic data:
    *   **Landing Page Analysis**: Get a professional UX/marketing review of your landing page based on its URL.
    *   **Traffic Insights**: Receive actionable recommendations and growth opportunities based on your actual traffic metrics.

---

## 💻 Tech Stack

*   **Frontend**: [React](https://react.dev/) (with Hooks)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charting**: [Recharts](https://recharts.org/)
*   **AI**: [Google Gemini API](https://ai.google.dev/) via `@google/genai` SDK
*   **Data Persistence**: Browser `localStorage` (for page list)
*   **Backend**: **Required**. This frontend is the client for a backend service that you must create. The backend is responsible for collecting pings from the tracking script and serving the aggregated data via an API.

---

## 🚀 Getting Started

### Prerequisites

*   A modern web browser.
*   A valid Google Gemini API key.
*   A backend service to collect and serve analytics data.

### Setup & Running the Application

This project is designed to run in an environment where the Gemini API key is securely managed.

1.  **Environment Variable**: Ensure that the `API_KEY` environment variable is set with your Google Gemini API key. The application is coded to read `process.env.API_KEY` to initialize the Gemini client.
2.  **Backend Configuration**: Set the `API_BASE_URL` environment variable to your backend API URL. The `services/apiService.ts` module makes real HTTP requests to your backend endpoints.
3.  **Open the App**: Launch the `index.html` file in your web browser.

---

## 🔧 How It Works

*   **API Service**: The `services/apiService.ts` module contains functions for fetching data from the backend. This is the primary integration point between the frontend and your data layer.
*   **Gemini Service**: The `services/geminiService.ts` module handles all interactions with the Gemini API. It constructs specific prompts for both landing page URL analysis and traffic data interpretation.
*   **State Management**: The application state (active page, traffic data, AI analysis, etc.) is managed within the main `App.tsx` component using React's `useState` and `useCallback` hooks.
*   **Component Structure**: The UI is broken down into reusable components located in the `components/` directory. This includes individual charts, stat cards, modals, and the main dashboard layout.
