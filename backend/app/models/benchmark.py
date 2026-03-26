from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    algorithms: Mapped[list] = mapped_column(JSON, nullable=False)
    sizes: Mapped[list] = mapped_column(JSON, nullable=False)
    pattern: Mapped[str] = mapped_column(String(50), nullable=False)
    results: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # BUG FIX: define the relationship so ORM-level cascade is possible
    # and the FK constraint exists at the DB level (see migration fix too).
    result_rows: Mapped[list["BenchmarkResult"]] = relationship(
        "BenchmarkResult", back_populates="run", cascade="all, delete-orphan"
    )


class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"
    # BUG FIX: add index on (algorithm) for the leaderboard GROUP BY query,
    # and an index on run_id for join lookups.
    __table_args__ = (
        Index("ix_benchmark_results_algorithm", "algorithm"),
        Index("ix_benchmark_results_run_id", "run_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # BUG FIX: run_id was a plain Integer with no FK — orphaned rows guaranteed
    # on any benchmark_run delete.  Added proper ForeignKey + ondelete cascade.
    run_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("benchmark_runs.id", ondelete="CASCADE"), nullable=False
    )
    algorithm: Mapped[str] = mapped_column(String(50), nullable=False)
    input_size: Mapped[int] = mapped_column(Integer, nullable=False)
    time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    memory_kb: Mapped[float] = mapped_column(Float, nullable=False)
    comparisons: Mapped[int] = mapped_column(Integer, nullable=False)
    pattern: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    run: Mapped["BenchmarkRun"] = relationship("BenchmarkRun", back_populates="result_rows")
