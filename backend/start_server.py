import os
import sys
import uvicorn

if __name__ == "__main__":
    # Run from project root: python backend/start_server.py
    # Insert the project root (parent of backend/) so "backend.app" is importable.
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_root)

    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "3001")),
        reload=False,
    )

