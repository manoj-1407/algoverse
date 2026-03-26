"""add FK constraint and indexes to benchmark_results
Revision ID: 002
Revises: 001
Create Date: 2025-01-01

This migration fixes a bug where benchmark_results.run_id had no FK constraint,
allowing orphaned rows. It also adds indexes for query performance.

NOTE: If you are doing a fresh install, migration 001 already includes these
fixes. This migration is only needed if you have an existing DB from the
original (unfixed) version.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def _has_constraint(conn, table, constraint_name):
    insp = Inspector.from_engine(conn)
    fks = insp.get_foreign_keys(table)
    return any(fk.get("name") == constraint_name for fk in fks)


def _has_index(conn, table, index_name):
    insp = Inspector.from_engine(conn)
    idxs = insp.get_indexes(table)
    return any(idx["name"] == index_name for idx in idxs)


def upgrade() -> None:
    conn = op.get_bind()

    # Add FK constraint if not already present
    if not _has_constraint(conn, "benchmark_results", "fk_benchmark_results_run_id"):
        with op.batch_alter_table("benchmark_results") as batch_op:
            batch_op.create_foreign_key(
                "fk_benchmark_results_run_id",
                "benchmark_runs",
                ["run_id"],
                ["id"],
                ondelete="CASCADE",
            )

    # Add indexes if not already present
    if not _has_index(conn, "benchmark_results", "ix_benchmark_results_run_id"):
        op.create_index("ix_benchmark_results_run_id", "benchmark_results", ["run_id"])

    if not _has_index(conn, "benchmark_results", "ix_benchmark_results_algorithm"):
        op.create_index("ix_benchmark_results_algorithm", "benchmark_results", ["algorithm"])


def downgrade() -> None:
    op.drop_index("ix_benchmark_results_algorithm", table_name="benchmark_results")
    op.drop_index("ix_benchmark_results_run_id", table_name="benchmark_results")
    with op.batch_alter_table("benchmark_results") as batch_op:
        batch_op.drop_constraint("fk_benchmark_results_run_id", type_="foreignkey")
