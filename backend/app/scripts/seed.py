"""Seed demo benchmark data."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.core.database import SessionLocal
from app.models.benchmark import BenchmarkRun, BenchmarkResult

def seed():
    db = SessionLocal()
    try:
        if db.query(BenchmarkRun).first():
            print("Already seeded"); return
        run = BenchmarkRun(algorithms=["quicksort","mergesort","heapsort"],
                           sizes=[100,500,1000], pattern="random", results={})
        db.add(run); db.flush()
        sample = [
            ("quicksort",100,0.08,1.2,620),("mergesort",100,0.12,2.1,672),("heapsort",100,0.10,1.1,756),
            ("quicksort",500,0.55,1.4,3900),("mergesort",500,0.72,2.8,4480),("heapsort",500,0.61,1.2,5600),
            ("quicksort",1000,1.20,1.6,9800),("mergesort",1000,1.55,3.2,9976),("heapsort",1000,1.31,1.3,12000),
        ]
        for algo,sz,t,mem,comp in sample:
            db.add(BenchmarkResult(run_id=run.id, algorithm=algo, input_size=sz,
                                   time_ms=t, memory_kb=mem, comparisons=comp, pattern="random"))
        db.commit()
        print("✓ Seeded demo benchmark data")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
