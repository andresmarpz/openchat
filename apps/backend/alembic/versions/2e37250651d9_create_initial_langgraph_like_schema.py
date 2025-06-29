"""Create initial LangGraph-like schema

Revision ID: 2e37250651d9
Revises: 
Create Date: 2025-06-29 15:15:33.033548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '2e37250651d9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create threads table
    op.create_table('threads',
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('values', sa.JSON(), nullable=True),
        sa.Column('thread_metadata', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(length=255), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('archived', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('thread_id')
    )
    
    # Create checkpoints table
    op.create_table('checkpoints',
        sa.Column('checkpoint_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('checkpoint_ns', sa.String(length=255), nullable=False),
        sa.Column('checkpoint_version', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('checkpoint_metadata', sa.JSON(), nullable=True),
        sa.Column('parent_checkpoint_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('checkpoint_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['parent_checkpoint_id'], ['checkpoints.checkpoint_id'], ),
        sa.ForeignKeyConstraint(['thread_id'], ['threads.thread_id'], ),
        sa.PrimaryKeyConstraint('checkpoint_id')
    )
    
    # Create runs table
    op.create_table('runs',
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_name', sa.String(length=255), nullable=True),
        sa.Column('run_type', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('progress', sa.Float(), nullable=False),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('run_metadata', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_details', sa.JSON(), nullable=True),
        sa.Column('parent_run_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cpu_time', sa.Float(), nullable=True),
        sa.Column('memory_usage', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['parent_run_id'], ['runs.run_id'], ),
        sa.ForeignKeyConstraint(['thread_id'], ['threads.thread_id'], ),
        sa.PrimaryKeyConstraint('run_id')
    )
    
    # Create tasks table
    op.create_table('tasks',
        sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('task_name', sa.String(length=255), nullable=False),
        sa.Column('task_type', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('task_metadata', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_details', sa.JSON(), nullable=True),
        sa.Column('sequence_order', sa.Integer(), nullable=True),
        sa.Column('depends_on', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.run_id'], ),
        sa.PrimaryKeyConstraint('task_id')
    )
    
    # Create checkpoint_writes table
    op.create_table('checkpoint_writes',
        sa.Column('write_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('checkpoint_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('task_id', sa.String(length=255), nullable=True),
        sa.Column('writes', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['checkpoint_id'], ['checkpoints.checkpoint_id'], ),
        sa.ForeignKeyConstraint(['thread_id'], ['threads.thread_id'], ),
        sa.PrimaryKeyConstraint('write_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('checkpoint_writes')
    op.drop_table('tasks')
    op.drop_table('runs')
    op.drop_table('checkpoints')
    op.drop_table('threads')
