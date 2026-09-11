from fastapi import FastAPI
from routes.analysis import router as analysis_router
from sqlalchemy import text
from database.database import engine


app = FastAPI(
    title="Vaani AI Backend",
    description="Backend API for AI-powered voice cloning detection",
    version="1.0.0"
)

app.include_router(
    analysis_router,
    prefix="/api"
)


@app.get("/")
def root():
    return {
        "message": "Vaani AI Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# temporary endpoint to check database connection

@app.get("/db-test")
def database_test():

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT 1")
            )

            value = result.scalar()

        return {
            "database": "connected",
            "result": value
        }

    except Exception as e:

        return {
            "database": "connection failed",
            "error": str(e)
        }