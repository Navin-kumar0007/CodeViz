# CodeViz: An Interactive Platform for Visualizing Code Execution

## Abstract
Learning to program is often a daunting task for beginners because the abstract concepts of memory management, control flow, and data structures are invisible during execution. **CodeViz** is a web-based educational platform designed to bridge this gap by visualizing code execution in real-time. By providing step-by-step state visualization, interactive practice environments, and gamified learning paths, CodeViz transforms the abstract nature of coding into a concrete, observable process. This project leverages the MERN stack to deliver a responsive, scalable, and engaging learning experience for students and instructors alike.

## 1. Introduction
The demand for software development skills is at an all-time high, yet computer science dropout rates remain significant. A primary barrier is the "mental model" gap: students struggle to visualize how a computer executes their code line-by-line. Standard IDEs are designed for professionals, offering static text and complex debuggers that overwhelm novices.

CodeViz addresses this by offering a "Whiteboard" approach to coding. It parses code (Python, JavaScript, Java, C++) and visually renders the stack, heap, and variable states as they change. Beyond visualization, the platform integrates modern educational strategies—including gamification (streaks, XP) and social learning (forums, sharing)—to create a holistic environment that sustains student motivation.

## 2. Literature Review
Existing tools like *Python Tutor* have pioneered code visualization but often suffer from outdated user interfaces, limited language support/scalability, or a lack of persistent learning tracks. Other platforms like *LeetCode* or *HackerRank* focus heavily on output correctness rather than the *process* of execution, making them better suited for interviews than for fundamental learning. CodeViz synthesizes the best of these worlds: the granular visualization of Python Tutor with the structured, gamified learning path of modern apps like *Duolingo* or *Codecademy*.

## 3. Software Requirements Specification (SRS)

### 3.1 Functional Requirements
1.  **Visualization Engine**: The system must parse code and generate step-by-step frames representing variable states and memory execution.
2.  **User Accounts**: Users must be able to register, log in, and track their individual progress.
3.  **Code Editor**: A syntax-highlighted editor (Monaco) supporting multiple languages.
4.  **Gamification**: The system must award XP and update streaks upon daily activity.
5.  **Social Features**: Users should be able to post in discussion forums and share persistent links to their code snippets.

### 3.2 Non-Functional Requirements
1.  **Performance**: Visualizations should generate within 2 seconds for standard algorithms.
2.  **Scalability**: The backend should handle concurrent users via stateless REST APIs.
3.  **Responsiveness**: The UI must adapt seamlessly to mobile (phones/tablets) and desktop screens.
4.  **Security**: User passwords must be hashed (bcrypt), and routes protected via JWT.

## 4. System Design
CodeViz is built on a **Microservices-inspired Monolithic Architecture** using the MERN Stack.

### 4.1 Architecture Diagram
The following diagram illustrates the data flow between the Client, API Gateway (Express), and Database.

```mermaid
graph TD
    Client[Client (React/Vite)]
    LB[Load Balancer / API Gateway]
    Auth[Auth Service (JWT)]
    Core[Core Backend (Node.js/Express)]
    DB[(MongoDB Atlas)]
    Socket[Socket.io Realtime Service]
    AI[Gemini AI Service]

    Client -- HTTPS Request --> LB
    LB --> Core
    Client -- WebSocket --> Socket
    Core -- Validate Token --> Auth
    Core -- Query/Write --> DB
    Core -- Analysis Request --> AI
    Socket -- Broadcast --> Client
```

### 4.2 Technology Stack
A comprehensive breakdown of the tools and technologies used.

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React 19 (Vite) | High performance, component reusability, fast build times. |
| **Backend** | Node.js + Express | Non-blocking I/O for handling concurrent visualization requests. |
| **Database** | MongoDB Atlas | Flexible schema for varying user data and code snippets. |
| **Realtime** | Socket.io | Low-latency communication for collaborative features. |
| **Editor** | Monaco Editor | Industry standard (VS Code engine) for robust code editing. |
| **Auth** | JWT + BCrypt | Stateless, secure authentication mechanism. |
| **AI** | Gemini API | Cost-effective, high-intelligence code analysis. |

### 4.3 Key API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | Authenticate user & return JWT | Public |
| `POST` | `/api/code/execute` | Execute code & return visualization | Protected |
| `GET` | `/api/snippets/public/all` | Fetch shared snippets | Public |
| `POST` | `/api/discussions` | Post a new comment | Protected |
| `GET` | `/api/gamification/stats` | Retrieve user XP/Streak | Protected |

## 5. Detailed Design

### 5.1 Database Schema
-   **User**: Stores profile, auth credentials, XP, streak data, and badge collection.
-   **Snippet**: Stores code content, language, owner reference, and sharing status (`isShared`, `sharedAt`).
-   **Discussion**: Stores lesson-specific threads, linking users to comments and replies.
-   **Lesson/Quiz**: Content management structures for the "Structured Learning" module.

### 5.2 Visualization Algorithm
The core engine intercepts standard output and memory pointers during code execution (running in a sandboxed child process). It captures a snapshot of the "Frame" (Stack + Heap) at every line of execution and sends this array of JSON frames to the frontend, which renders it as an interactive animation.

## 6. Project Management

### 6.1 Project Timeline (Gantt)

| Phase | Duration | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1: Planning** | Week 1-2 | Requirement gathering, SRS, Tech Stack selection | ✅ Completed |
| **Phase 2: Core Dev** | Week 3-5 | Setup Backend/Frontend, Auth, Basic Visualization | ✅ Completed |
| **Phase 3: Learning** | Week 6-7 | Lessons, Quizzes, Progress Tracking DB | ✅ Completed |
| **Phase 4: AI & Gamification** | Week 8-9 | Gemini Integration, XP System, Streaks | ✅ Completed |
| **Phase 5: Social & Polish** | Week 10 | Forums, Code Sharing, Mobile Optimization | ✅ Completed |
| **Phase 6: Deployment** | Week 11 | Dockerization, AWS Setup, CI/CD Pipeline | 🚧 In Progress |

### 6.2 Risk Analysis Matrix

| Risk | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **API Rate Limits** | High | Medium | Implement caching (Redis) and exponential backoff. |
| **Code Execution Security** | Medium | Critical | Use isolated Docker containers for running user code. |
| **Database Latency** | Low | High | Index frequently queried text fields; Implementation of CDN. |
| **User Drop-off** | Medium | High | Engagement via Gamification (Streaks/Badges). |

### 6.3 Resource & Cost Estimation

| Resource | Estimated Cost (Monthly) | Justification |
| :--- | :--- | :--- |
| **Hosting (AWS EC2)** | $15.00 | Application server hosting. |
| **Database (MongoDB)** | Free (M0 Tier) | Sufficient for <500MB data. |
| **AI API (Gemini)** | Free (Tier) / Usage | Low volume API usage is currently free. |
| **Domain & SSL** | $1.00 (amortized) | Branding and Security. |
| **Total** | **~$16.00 / month** | Extremely cost-effective start-up model. |

## 7. Testing Strategy
We employed a mix of manual and automated testing strategies:
-   **Unit Testing**: Verified utility functions (like the gamification logic for streak calculation).
-   **Integration Testing**: Tested the flow from Frontend -> API -> Database (e.g., ensuring a shared snippet actually appears in the public viewer).
-   **Compatibility Testing**: Manually verified UI responsiveness on different viewports (Mobile vs. Desktop) to ensure the editor and visualizer stack correctly.
-   **Edge Case Testing**: Validated error handling, such as network failures during package installation (solved via local fallbacks).

## 8. Future Enhancements & Scalability
The foundation of CodeViz allows for exciting future expansions:

### 8.1 Planned Features
1.  **Real-time Collaboration**: Expanding the Socket.io layer to allow Google Docs-style pair programming.
2.  **Compiler Services**: Offloading code execution to isolated Docker containers for better security and support for compiled languages like Rust or Go.

### 8.2 Scalability Plan
To handle 10,000+ concurrent users:
-   **Containerization**: Deploy backend using **Docker** and orchestrate with **Kubernetes** (K8s) for auto-scaling.
-   **Load Balancing**: Use NGINX to distribute traffic across multiple backend nodes.
-   **Caching**: Implement Redis for storing visualization results of common code snippets to reduce compute load.

## 9. Conclusion
CodeViz successfully demonstrates that complex programming concepts can be made accessible through visualization. By combining a robust technical implementation with user-centric design principles—gamification, social interaction, and mobile accessibility—the platform offers a modern solution to the age-old problem of learning to code. The project stands as a fully functional proof-of-concept ready for real-world deployment.
