<p align="center">
  <img src="./public/banner.png" alt="CureCart — AI-Powered Digital Pharmacy Platform" width="100%" />
</p>

# CureCart 🏥✨

**An AI-Powered Digital Pharmacy Platform**

CureCart is a next-generation healthcare e-commerce platform built with modern web technologies and Generative AI. It seamlessly integrates a robust digital pharmacy with intelligent, real-time AI assistance to provide users with verified medical data, instant prescription processing, and personalized health guidance.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

---

## 🚀 Key Features

*   **Agentic Web Search (RAG Pipeline):** Integrates the **Tavily Search API** and **Google Gemini** to fetch live, verified medical data from FDA and WHO databases, providing highly accurate, hallucination-free AI responses.
*   **Global Health Assistant:** A premium, interactive AI Chatbot available globally across the application to instantly assist users with symptoms, drug interactions, and medical queries.
*   **Smart Fallback Search:** Intelligently redirects zero-result catalog searches to the AI engine to provide contextual health guidance rather than dead-end error pages.
*   **Premium UI/UX:** Designed with meticulous attention to detail using Tailwind CSS, featuring glassmorphism effects, custom micro-animations, and a responsive mobile-first architecture (Emerald Theme).
*   **Performance Optimized:** Built on Next.js 15 App Router with full Server-Side Rendering (SSR) and Edge caching, ensuring blazing fast load times and a 95+ Lighthouse performance score.
*   **Scalable Architecture:** End-to-end strict TypeScript typing and Prisma ORM for robust database management and zero runtime errors.

## 🛠️ Tech Stack

**Frontend:**
*   Next.js 15 (App Router)
*   React 19
*   TypeScript
*   Tailwind CSS
*   Lucide React (Icons)
*   Framer Motion (Animations)

**Backend:**
*   Node.js
*   Next.js Route Handlers (RESTful APIs)
*   Prisma ORM
*   PostgreSQL

**AI & Integrations:**
*   Google Gemini API (Generative AI & OCR)
*   Tavily Search API (Real-time data retrieval / RAG)

---

## 💻 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Princeag1310/CureCart.git
cd CureCart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/curecart"

# Google Gemini API Key for AI features
GEMINI_API_KEY="your_gemini_api_key"

# Tavily API Key for Agentic Web Search
TAVILY_API_KEY="your_tavily_api_key"

# Next Auth (if applicable)
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup the Database

Initialize Prisma and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📈 Deployment

This application is optimized for deployment on **Vercel**.

Ensure all environment variables are correctly configured in your Vercel project settings, and that the build command is set to:

```bash
prisma generate && next build
```

---

*Designed and engineered to revolutionize digital healthcare access.*
