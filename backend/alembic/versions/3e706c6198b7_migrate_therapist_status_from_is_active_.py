"""migrate_therapist_status_from_is_active_to_enum

Revision ID: 3e706c6198b7
Revises: 
Create Date: 2025-12-25 17:20:07.062964

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e706c6198b7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

