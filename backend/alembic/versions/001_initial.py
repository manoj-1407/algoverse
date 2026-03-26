"""initial schema
Revision ID: 001
Revises:
Create Date: 2024-01-01

FIXES vs original:
  - benchmark_results.run_id now has a proper ForeignKey constraint with CASCADE
  - Added index on benchmark_results(algorithm) for leaderboard GROUP BY
  - Added index on benchmark_results(run_id) for join lookups
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "benchmark_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("algorithms", sa.JSON(), nullable=False),
        sa.Column("sizes", sa.JSON(), nullable=False),
        sa.Column("pattern", sa.String(50), nullable=False),
        sa.Column("results", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "benchmark_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        # BUG FIX: ForeignKey + ondelete CASCADE — was plain Integer before
        sa.Column(
            "run_id",
            sa.Integer(),
            sa.ForeignKey("benchmark_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("algorithm", sa.String(50), nullable=False),
        sa.Column("input_size", sa.Integer(), nullable=False),
        sa.Column("time_ms", sa.Float(), nullable=False),
        sa.Column("memory_kb", sa.Float(), nullable=False),
        sa.Column("comparisons", sa.Integer(), nullable=False),
        sa.Column("pattern", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    # Indexes for query performance
    op.create_index("ix_benchmark_results_run_id", "benchmark_results", ["run_id"])
    op.create_index("ix_benchmark_results_algorithm", "benchmark_results", ["algorithm"])


def downgrade() -> None:
    op.drop_index("ix_benchmark_results_algorithm", table_name="benchmark_results")
    op.drop_index("ix_benchmark_results_run_id", table_name="benchmark_results")
    op.drop_table("benchmark_results")
    op.drop_table("benchmark_runs")
