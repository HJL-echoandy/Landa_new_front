"""migrate_therapist_status_from_is_active_to_enum

Revision ID: 00c9c2a41d20
Revises: 3e706c6198b7
Create Date: 2025-12-25 17:21:17.125362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00c9c2a41d20'
down_revision: Union[str, None] = '3e706c6198b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

