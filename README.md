# Algoverse

[![CI](https://github.com/manoj-1407/algoverse/actions/workflows/ci.yml/badge.svg)](https://github.com/manoj-1407/algoverse/actions)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)

Started as a DAA project. Got out of hand. Now it's a full-stack platform with 34+ algorithms, real benchmark persistence, WebSocket battle mode, sound synthesis, and a Three.js landing page.

---

## What it does

**Sort Visualizer** — Pick any of 12 sorting algorithms, hit play, and watch it go frame by frame. Every swap and comparison is tracked. The Web Audio API synthesizes tones mapped to element values, so you can literally hear bubble sort vs quicksort. There's a speed slider, step-through controls, and pause.

**Battle Mode** — Two algorithms, same dataset, racing in real time over a WebSocket connection. Side-by-side bar charts animate simultaneously. Whoever finishes first wins.

**Benchmark Engine** — Select up to 8 algorithms, pick a dataset pattern (random, nearly sorted, reversed, etc.), run it. D3.js plots runtime curves across 5 input sizes from 100 to 5000 elements, averaged over 3 runs. Every result gets written to PostgreSQL. You can export CSV or JSON.

**Leaderboard** — Pulls all past benchmark runs from the database and ranks every algorithm by average execution time. Redis-cached at 60s TTL so repeated loads are instant.

**Compare** — Head-to-head at a single input size. Returns time, comparisons, swaps, and memory side by side.

**Algorithm Labs** — Seven interactive labs covering Graph traversal, Dynamic Programming, Backtracking, String Matching, and Math algorithms. Each lab takes JSON input and returns full visualizations — D3 graph traversal, DP table heatmaps, N-Queens board, maze grid, Sudoku solver.

**Landing Page** — Three.js scene with 3000 particles, a DNA helix, and orbiting rings. Runs on WebGL, handles GPU instancing. Probably overkill for a portfolio project but it looks good.

---

## Algorithms

**Sorting (12):** QuickSort, MergeSort, HeapSort, TimSort, ShellSort, BubbleSort, InsertionSort, SelectionSort, CountingSort, RadixSort, CocktailSort, GnomeSort

**Graph (8):** Dijkstra, A*, BFS, DFS, Bellman-Ford, Floyd-Warshall, Prim's MST, Topological Sort

**Dynamic Programming (7):** Fibonacci (bottom-up + memoized), LCS, Edit Distance, 0/1 Knapsack, Coin Change, LIS, Matrix Chain Multiplication

**Backtracking (3):** N-Queens, Sudoku Solver, Maze Pathfinder

**String Matching (2):** KMP, Rabin-Karp

**Math (4):** Sieve of Eratosthenes, Huffman Coding, Euclidean GCD/LCM, Fast Exponentiation

---

## Stack

**Backend:** Python 3.11 + FastAPI (async) + SQLAlchemy 2 + Alembic + PostgreSQL 16 + Redis 7 + WebSockets + pytest

**Frontend:** TypeScript 5 + React 18 + Three.js (via R3F) + D3.js v7 + Zustand + Framer Motion + Tailwind CSS + Vite 5

**Infra:** Docker Compose + Nginx + GitHub Actions CI

---

## Running it

Requirements: Docker Desktop (or Engine + Compose V2), Git.

```bash
git clone https://github.com/manoj-1407/algoverse.git
cd algoverse
cp .env.example .env
docker compose up -d --build
```

First build takes 2-3 minutes. After that:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

**Useful make commands:**

```bash
make up          # start everything
make down        # stop everything
make logs        # follow logs
make test        # run backend tests
make seed        # seed demo benchmark data
make shell-be    # shell into backend container
make shell-db    # psql into postgres
make clean       # nuke containers + volumes
```

**Without Docker (backend):**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
docker compose up db redis -d
alembic upgrade head
python -m app.scripts.seed
uvicorn app.main:app --reload --port 8000
```

**Without Docker (frontend):**

```bash
cd frontend && npm install && npm run dev
```

---

## Tests

```bash
make test
# or
cd backend && pytest tests/ -v --tb=short
```

37 tests across unit and integration. Covers all 12 sorting algorithms on random/empty/edge inputs, DP correctness (LCS length, coin change, LIS), backtracking (N-Queens 92-solution count for n=8), KMP match positions, and all API endpoints.

CI runs on every push to `main` and `develop`.

---

## Project structure

```
algoverse/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── sorting.py              # 12 sorting algos + step tracking
│   │   │   ├── graph.py                # 8 graph algos
│   │   │   ├── dynamic_programming.py  # 7 DP problems
│   │   │   └── misc.py                 # backtracking, string, math
│   │   ├── api/v1/endpoints/
│   │   │   ├── sorting.py              # /sort, /compare, /benchmark
│   │   │   ├── benchmark.py            # /benchmark, /leaderboard
│   │   │   ├── graph.py                # /graph, /graph/astar
│   │   │   └── algorithms.py           # /dp, /backtrack, /string, /math
│   │   ├── core/
│   │   │   ├── config.py               # pydantic-settings, reads .env
│   │   │   ├── database.py             # SQLAlchemy engine + session
│   │   │   └── cache.py                # Redis client
│   │   ├── models/benchmark.py         # ORM models
│   │   ├── middleware/                 # rate limiting + request timing
│   │   ├── schemas/                    # Pydantic response models
│   │   └── main.py                     # app entry, WebSocket handlers
│   ├── alembic/versions/               # migrations
│   └── tests/
│       ├── unit/test_algorithms.py
│       └── integration/test_api.py
├── frontend/src/
│   ├── components/
│   │   ├── three/Scene.tsx             # Three.js landing scene
│   │   ├── visualizers/                # D3 graph, DP heatmap, board grids
│   │   └── layout/                     # sidebar, theme toggle
│   ├── pages/
│   │   ├── Visualizer.tsx              # sort visualizer + audio
│   │   ├── BattleMode.tsx              # WebSocket race
│   │   ├── Benchmark.tsx               # D3 curves
│   │   ├── Compare.tsx                 # head-to-head
│   │   └── Labs.tsx                    # algorithm labs
│   ├── stores/app.ts                   # Zustand state
│   └── utils/
│       ├── api.ts                      # Axios client
│       └── sound.ts                    # Web Audio engine
├── nginx/nginx.conf
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## API

Full docs at `http://localhost:8000/docs` once running.

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/v2/algorithms` | list all algorithms + complexity metadata |
| GET | `/api/v2/dataset` | generate dataset by size + pattern |
| POST | `/api/v2/sort` | run sort, optionally with per-step data |
| POST | `/api/v2/benchmark` | run benchmark, save to DB |
| POST | `/api/v2/compare` | head-to-head at one input size |
| GET | `/api/v2/leaderboard` | global rankings (Redis-cached) |
| POST | `/api/v2/graph` | graph traversal |
| POST | `/api/v2/graph/astar` | A* on a 2D grid |
| POST | `/api/v2/dp` | DP problems |
| POST | `/api/v2/backtrack` | backtracking solvers |
| POST | `/api/v2/string` | pattern matching |
| POST | `/api/v2/math` | math algorithms |
| WS | `/ws/battle/{room_id}` | battle mode WebSocket |

---

## Security

Credentials live in `.env` which is git-ignored. `.env.example` ships with `change_me` placeholders — that's the only thing that touches the repo. No real passwords are hardcoded anywhere in the source.

Other things: Nginx sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. Redis is password-protected. Pydantic validates every request with size and value constraints. CORS origin whitelist via `ALLOWED_ORIGINS` env var.

---

## WSL note

If Docker conflicts with native services:

```bash
sudo service redis-server stop
sudo service postgresql stop
docker compose up -d --build
```

---

## License

MIT
