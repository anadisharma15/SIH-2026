from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    func
)

from sqlalchemy.orm import Mapped, mapped_column

from database.database import Base


class MLModel(Base):

    __tablename__ = "ml_models"

    model_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    model_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )


class Analysis(Base):

    __tablename__ = "analyses"

    analysis_id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    file_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    ai_probability: Mapped[float] = mapped_column(
        Numeric(5, 4),
        nullable=False
    )

    is_ai_generated: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    risk_score: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    risk_message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    model_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            "ml_models.model_id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    __table_args__ = (

        CheckConstraint(
            "file_size_bytes > 0 AND file_size_bytes <= 10485760",
            name="valid_file_size"
        ),

        CheckConstraint(
            "ai_probability >= 0 AND ai_probability <= 1",
            name="valid_ai_probability"
        ),

        CheckConstraint(
            "risk_score >= 0 AND risk_score <= 100",
            name="valid_risk_score"
        ),

        CheckConstraint(
            "risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')",
            name="valid_risk_level"
        )
    )