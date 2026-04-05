"""Change achievement condition_value from integer to string

Revision ID: 003
Revises: 002
Create Date: 2026-04-04
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Change condition_value from Integer to String(50)
    op.alter_column(
        "achievements",
        "condition_value",
        existing_type=sa.Integer(),
        type_=sa.String(50),
        existing_nullable=False,
        postgresql_using="condition_value::text",
    )


def downgrade() -> None:
    op.alter_column(
        "achievements",
        "condition_value",
        existing_type=sa.String(50),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="condition_value::integer",
    )
