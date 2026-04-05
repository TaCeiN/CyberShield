"""Initial migration

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('security_level', sa.Integer(), server_default='100', nullable=False),
        sa.Column('total_xp', sa.Integer(), server_default='0', nullable=False),
        sa.Column('current_league', sa.String(20), server_default='newbie', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email'),
    )

    op.create_table(
        'scenarios',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('slug', sa.String(50), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('difficulty', sa.Integer(), server_default='1', nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    op.create_table(
        'missions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scenario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('story_text', sa.Text(), nullable=True),
        sa.Column('attack_type', sa.String(50), nullable=False),
        sa.Column('environment', sa.String(50), nullable=False),
        sa.Column('difficulty', sa.Integer(), server_default='1', nullable=False),
        sa.Column('xp_reward', sa.Integer(), server_default='100', nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='0', nullable=False),
        sa.Column('time_limit_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        sa.ForeignKeyConstraint(['scenario_id'], ['scenarios.id'], ondelete='CASCADE'),
    )

    op.create_table(
        'mission_steps',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('mission_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_order', sa.Integer(), nullable=False),
        sa.Column('context_text', sa.Text(), nullable=False),
        sa.Column('context_type', sa.String(50), nullable=False),
        sa.Column('context_data', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['mission_id'], ['missions.id'], ondelete='CASCADE'),
    )

    op.create_table(
        'step_choices',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('step_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('choice_text', sa.String(500), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('feedback_text', sa.Text(), nullable=False),
        sa.Column('consequence_text', sa.Text(), nullable=True),
        sa.Column('hp_change', sa.Integer(), server_default='0', nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='0', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['step_id'], ['mission_steps.id'], ondelete='CASCADE'),
    )

    op.create_table(
        'user_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('mission_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(20), server_default='not_started', nullable=False),
        sa.Column('current_step', sa.Integer(), server_default='0', nullable=False),
        sa.Column('correct_answers', sa.Integer(), server_default='0', nullable=False),
        sa.Column('wrong_answers', sa.Integer(), server_default='0', nullable=False),
        sa.Column('xp_earned', sa.Integer(), server_default='0', nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['mission_id'], ['missions.id']),
        sa.UniqueConstraint('user_id', 'mission_id', name='uq_user_mission'),
    )

    op.create_table(
        'user_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('choice_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('answered_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['step_id'], ['mission_steps.id']),
        sa.ForeignKeyConstraint(['choice_id'], ['step_choices.id']),
    )

    op.create_table(
        'leaderboard',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('total_xp', sa.Integer(), server_default='0', nullable=False),
        sa.Column('missions_completed', sa.Integer(), server_default='0', nullable=False),
        sa.Column('accuracy_percent', sa.Float(), server_default='0', nullable=False),
        sa.Column('league', sa.String(20), server_default='newbie', nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.UniqueConstraint('user_id'),
    )

    op.create_table(
        'achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('slug', sa.String(50), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(50), nullable=False),
        sa.Column('condition_type', sa.String(50), nullable=False),
        sa.Column('condition_value', sa.Integer(), nullable=False),
        sa.Column('xp_bonus', sa.Integer(), server_default='50', nullable=False),
        sa.Column('rarity', sa.String(20), server_default='common', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    op.create_table(
        'user_achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('achievement_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('earned_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id']),
        sa.UniqueConstraint('user_id', 'achievement_id', name='uq_user_achievement'),
    )


def downgrade() -> None:
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('leaderboard')
    op.drop_table('user_answers')
    op.drop_table('user_progress')
    op.drop_table('step_choices')
    op.drop_table('mission_steps')
    op.drop_table('missions')
    op.drop_table('scenarios')
    op.drop_table('users')
