"""FastAPI application factory"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, candidate
from app.db.database import Base, engine

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Portfolio CV Hub API",
    description="Backend API for Portfolio CV Hub - Candidate Module",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(candidate.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK", "service": "Portfolio CV Hub Backend"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Portfolio CV Hub Backend API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
