# CodeViz 🎨

**Visual Code Execution Tracer** - Watch your algorithms come to life with step-by-step visualization.

## ✨ Features

- **Multi-language Support**: Python, JavaScript, TypeScript, Java, C++, C (fully traced/visualized) + Go, Rust (run)
- **Real debugger-based tracing**: C/C++ via GDB, Java via JDI — accurate call stacks, locals & recursion
- **Live Visualization**: Arrays, Stacks, Queues, Linked Lists, Trees, Graphs
- **Step-by-Step Debugging**: Walk through your code line by line
- **Virtual Scrolling**: Handle 1000+ element arrays smoothly
- **Beautiful UI**: Modern glassmorphism design with animations

## 🛠️ Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 | Node.js + Express 5 |
| Vite 7 | Socket.IO |
| Framer Motion | MongoDB + Mongoose |
| react-window | Language Runners (JS/Python/Java/C++) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (for user authentication)
- Java JDK (for Java code execution)
- Python 3 (for Python code execution)
- GCC/G++ (for C++ code execution)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CodeViz.git
cd CodeViz

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

Create `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/codeviz
JWT_SECRET=your_jwt_secret_here
```

### Running the App

```bash
# Terminal 1 - Backend
cd backend
npx nodemon server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
CodeViz/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Visualizer/      # Canvas, VirtualizedArray
│   │   │   ├── Editor/          # Monaco code editor
│   │   │   └── Controls/        # Playback controls
│   │   ├── pages/               # Login, Signup, Dashboard, Practice
│   │   ├── contexts/            # Theme context
│   │   └── examples.js          # Code examples
│   └── package.json
│
├── backend/
│   ├── engine/
│   │   ├── jsTracer.js          # JavaScript tracer
│   │   ├── tracer.py            # Python tracer
│   │   ├── javaRunner.js        # Java runner
│   │   └── cppRunner.js         # C++ runner
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── README.md
```

## 📊 Supported Visualizations

| Type | Description |
|------|-------------|
| **Array** | Index-labeled boxes with animations |
| **Stack** | Vertical LIFO visualization |
| **Queue** | Horizontal FIFO with front/rear markers |
| **Linked List** | Nodes with arrow connections |
| **Tree** | Hierarchical node structure |
| **Graph** | Adjacency list representation |

## 🎯 Usage

1. **Login/Signup** to access the visualizer
2. Select a **language** (Python, JavaScript, Java, C++)
3. Write or select **example code**
4. Click **Run** to execute and visualize
5. Use **Step controls** to navigate execution

## 📝 License

MIT License - feel free to use and modify!

---

Built with ❤️ for algorithm lovers
