<div align="center">

<img src="https://img.shields.io/badge/Algoverse-v3.0-6366f1?style=for-the-badge&labelColor=020209" />

# 🌌 Algoverse
### *The Computational Universe*

**34+ algorithms. Visualized. Benchmarked. Heard. Battled. In 3D.**

<br/>

[![CI](https://github.com/manoj-1407/algoverse/actions/workflows/ci.yml/badge.svg)](https://github.com/manoj-1407/algoverse/actions)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

<br/>

> *Not a tutorial. A full-stack engineering platform built around algorithms.*

</div>

---

## What is Algoverse?

Algoverse is a full-stack algorithm research and visualization platform — built as a DAA (Design and Analysis of Algorithms) project, engineered like a production system.

Every algorithm is interactive, benchmarked against real data, and displayed through rich visualizations. It isn't a static diagram site — you run real code on the backend, see real timing data, and persist results to a real database.

---

## ✨ Feature Overview

### 🎬 Sort Visualizer
Animate any of 12 sorting algorithms frame-by-frame. Every comparison, swap, and pivot is tracked. Sound is synthesized through the Web Audio API — pitch maps to value, so you literally *hear* the sort happen. Includes play/pause, step controls, speed slider, and a live algorithm search filter.

### ⚔️ Battle Mode
Two algorithms run simultaneously on the exact same dataset. Side-by-side bar charts race in real time over a WebSocket connection. Winner is declared with a VS performance bar.

### 📊 Benchmark Engine
Select up to 8 algorithms, choose a dataset pattern, and run. Results are plotted as D3.js runtime complexity curves across 5 input sizes (100 → 5,000 elements), averaged over 3 runs. Every result is persisted to PostgreSQL. Export as CSV or JSON.

### 🏆 Leaderboard
Aggregates all past benchmark runs from the database. Ranks every algorithm by average execution time. Redis-cached with a 60-second TTL for instant repeated loads.

### ⚖️ Compare
Head-to-head at a single input size. Returns time, comparisons, swaps, and memory — ranked #1, #2, etc.

### 🔬 Seven Algorithm Labs
Interactive JSON-input labs for Graph, Dynamic Programming, Backtracking, String Matching, and Mathematical algorithms — each with full result visualization (D3 graph traversal, DP table heatmaps, Queens board, maze grid, Sudoku solver).

### 🌌 3D Landing Universe
React Three Fiber scene with 3,000 colored particles, a DNA double helix, floating wireframe cubes, and orbiting rings. Runs entirely on the GPU through WebGL.

### 🎨 Theme System
Dark, Light, and System Default (follows OS preference). Persisted to `localStorage` with smooth CSS transitions.

---

## 🧮 Algorithm Inventory

### Sorting — 12 algorithms

| Algorithm | Average | Worst | Space | Stable | Category |
|---|---|---|---|---|---|
| QuickSort | O(n log n) | O(n²) | O(log n) | No | Divide & Conquer |
| MergeSort | O(n log n) | O(n log n) | O(n) | Yes | Divide & Conquer |
| HeapSort | O(n log n) | O(n log n) | O(1) | No | Selection |
| BubbleSort | O(n²) | O(n²) | O(1) | Yes | Exchange |
| InsertionSort | O(n²) | O(n²) | O(1) | Yes | Insertion |
| SelectionSort | O(n²) | O(n²) | O(1) | No | Selection |
| ShellSort | O(n log n) | O(n²) | O(1) | No | Insertion |
| CountingSort | O(n+k) | O(n+k) | O(k) | Yes | Non-comparison |
| RadixSort | O(nk) | O(nk) | O(n+k) | Yes | Non-comparison |
| CocktailSort | O(n²) | O(n²) | O(1) | Yes | Exchange |
| GnomeSort | O(n²) | O(n²) | O(1) | Yes | Exchange |
| TimSort | O(n log n) | O(n log n) | O(n) | Yes | Hybrid |

### Graph — 8 algorithms
Dijkstra · A\* Pathfinding · BFS · DFS · Bellman-Ford · Floyd-Warshall · Prim's MST · Topological Sort

### Dynamic Programming — 7 problems
Fibonacci (bottom-up + memoized) · LCS · Edit Distance · 0/1 Knapsack · Coin Change · LIS · Matrix Chain Multiplication

### Backtracking — 3 problems
N-Queens (92 solutions for n=8) · Sudoku Solver · Maze Pathfinder

### String Matching — 2 algorithms
KMP (Knuth-Morris-Pratt) · Rabin-Karp (rolling hash)

### Mathematical — 4 algorithms
Sieve of Eratosthenes · Huffman Coding · Euclidean GCD/LCM · Fast Exponentiation

---

## 🏗 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI 0.111 (async, auto OpenAPI docs) |
| ORM | SQLAlchemy 2 with mapped_column syntax |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (token-bucket rate limiting + query cache) |
| Real-time | WebSockets (FastAPI native, battle rooms) |
| Testing | pytest + httpx (37 tests, unit + integration) |
| Linting | ruff |

### Frontend
| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Framework | React 18 |
| 3D Engine | React Three Fiber + Three.js |
| Charts | D3.js v7 (benchmark curves) |
| Animation | Framer Motion |
| State | Zustand |
| Styling | Tailwind CSS 3 |
| Audio | Web Audio API (custom synthesis engine) |
| Icons | Lucide React |
| Build | Vite 5 |

### Infrastructure
| Layer | Technology |
|---|---|
| Containers | Docker + Docker Compose |
| Proxy | Nginx (reverse proxy, security headers) |
| CI/CD | GitHub Actions (test + build on every push) |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Compose V2)
- Git

### Run in 2 commands

```bash
git clone https://github.com/manoj-1407/algoverse.git
cd algoverse
cp .env.example .env          # edit passwords if needed
docker compose up -d --build
```

Wait ~2–3 minutes for first build, then open:

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend |
| http://localhost:8000/docs | Interactive API docs (Swagger) |
| http://localhost:8000/redoc | ReDoc API reference |

---

## 🛠 Development Commands

```bash
make up          # Start all containers
make down        # Stop all containers
make logs        # Follow container logs
make test        # Run all backend tests
make lint        # Run ruff linter
make seed        # Re-seed demo benchmark data
make shell-be    # Shell into backend container
make shell-db    # psql into PostgreSQL
make clean       # Remove containers, volumes, caches
```

### Run backend without Docker

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

docker compose up db redis -d   # Only DB + Redis in Docker

alembic upgrade head
python -m app.scripts.seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run frontend without Docker

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Tests

```bash
make test
# or
cd backend && pytest tests/ -v --tb=short
```

**37 tests covering:**
- All 12 sorting algorithms — correctness on random, empty, and edge inputs
- DP algorithms — LCS length, coin change minimum, LIS length
- Backtracking — N-Queens 92-solution count for n=8
- String — KMP match positions
- API endpoints — sort, compare, dp, backtrack, health check

CI runs automatically on every push to `main` and `develop`.

---

## 📁 Project Structure

```
algoverse/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── sorting.py              # 12 sorting algorithms, step tracking, metrics
│   │   │   ├── graph.py                # 8 graph algorithms
│   │   │   ├── dynamic_programming.py  # 7 DP problems with full tables
│   │   │   └── misc.py                 # Backtracking, string, math
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── sorting.py          # /sort, /compare, /dataset, /algorithms
│   │   │   │   ├── benchmark.py        # /benchmark, /leaderboard
│   │   │   │   ├── graph.py            # /graph, /graph/astar
│   │   │   │   └── algorithms.py       # /dp, /backtrack, /string, /math
│   │   │   └── router.py               # Assembles all sub-routers
│   │   ├── core/
│   │   │   ├── config.py               # Settings (pydantic-settings, .env)
│   │   │   ├── database.py             # SQLAlchemy engine + session
│   │   │   └── cache.py                # Redis client with typed helpers
│   │   ├── models/benchmark.py         # ORM models (FK, indexes)
│   │   ├── middleware/__init__.py       # Rate limiting + request timing
│   │   ├── schemas/__init__.py          # Pydantic response models
│   │   ├── utils/__init__.py            # timed_run, clamp, paginate helpers
│   │   ├── scripts/seed.py             # Demo data seeder
│   │   └── main.py                     # FastAPI app, middleware, WebSocket
│   ├── alembic/versions/               # Database migrations
│   └── tests/
│       ├── unit/test_algorithms.py     # Algorithm correctness
│       └── integration/test_api.py    # HTTP endpoint tests
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── three/Scene.tsx         # 3D particle universe (R3F + Three.js)
│       │   ├── layout/                 # Sidebar (theme toggle), Layout (data-theme)
│       │   ├── charts/ComplexityRadar.tsx
│       │   └── visualizers/            # Graph D3, DP heatmap, Board grids
│       ├── pages/
│       │   ├── Landing.tsx             # 3D hero + feature grid
│       │   ├── Visualizer.tsx          # Sort visualizer + Web Audio
│       │   ├── BattleMode.tsx          # Real-time algorithm race
│       │   ├── Benchmark.tsx           # D3 curves + CSV/JSON export
│       │   ├── Compare.tsx             # Head-to-head table
│       │   └── Labs.tsx                # All 7 algorithm labs
│       ├── stores/app.ts               # Zustand: sound + theme (localStorage)
│       ├── utils/
│       │   ├── api.ts                  # Typed Axios client
│       │   └── sound.ts                # Web Audio synthesis engine
│       └── types/index.ts              # Shared TypeScript types
├── nginx/nginx.conf                    # Reverse proxy + security headers
├── .github/workflows/ci.yml           # GitHub Actions CI
├── docker-compose.yml
├── Makefile
├── .env.example                        # Template — copy to .env and fill in
└── setup.sh                            # One-shot WSL/Linux setup script
```

---

## 🔒 Security

| Concern | How it's handled |
|---|---|
| Credentials | All passwords in `.env` — git-ignored, never committed |
| `.env.example` | Ships with `change_me` placeholders — safe to commit |
| Config defaults | No real credentials hardcoded in source files |
| Rate limiting | Nginx + per-IP token bucket in middleware |
| HTTP headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` via Nginx |
| Redis | Password-protected (`requirepass`) |
| Input validation | Pydantic models on every endpoint — size and value constraints |
| CORS | Explicit origin whitelist via `ALLOWED_ORIGINS` env var |

---

## 📖 API Reference

Full interactive docs at **`http://localhost:8000/docs`**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v2/algorithms` | List all 34+ algorithms with complexity metadata |
| `GET` | `/api/v2/dataset?size=N&pattern=P` | Generate a dataset |
| `POST` | `/api/v2/sort` | Sort with optional per-step tracking |
| `POST` | `/api/v2/benchmark` | Runtime curves → saved to PostgreSQL |
| `POST` | `/api/v2/compare` | Head-to-head at one input size |
| `GET` | `/api/v2/leaderboard` | Global rankings (Redis-cached, 60s TTL) |
| `POST` | `/api/v2/graph` | Graph traversal algorithms |
| `POST` | `/api/v2/graph/astar` | A\* on a 2D grid |
| `POST` | `/api/v2/dp` | Dynamic programming problems |
| `POST` | `/api/v2/backtrack` | Backtracking solvers |
| `POST` | `/api/v2/string` | Pattern matching |
| `POST` | `/api/v2/math` | Mathematical algorithms |
| `WS` | `/ws/battle/{room_id}` | Real-time battle WebSocket |

---

## 🙋 WSL Users (Windows)

If port conflicts occur when starting Docker:

```bash
# Stop native services that conflict with Docker
sudo service redis-server stop
sudo service postgresql stop

# Prevent auto-start on WSL boot (recommended)
sudo systemctl disable redis-server postgresql

# Start the project
docker compose up -d --build
```

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Algoverse v3.0** · Built by [manoj-1407](https://github.com/manoj-1407)

*Where algorithms come alive.*

</div>
