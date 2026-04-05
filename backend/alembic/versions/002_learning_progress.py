"""Add learning_progress table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'learning_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scenario_id', sa.Integer, nullable=False),
        sa.Column('theme', sa.String(50), nullable=False),
        sa.Column('is_correct', sa.Boolean, nullable=False),
        sa.Column('completed_at', sa.DateTime, server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'scenario_id', name='uq_learning_user_scenario'),
    )


def downgrade() -> None:
    op.drop_table('learning_progress')
