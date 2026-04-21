#!/bin/bash
# Start the English Learning App backend
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
  venv/bin/pip install -r requirements.txt
fi

echo "Running migrations..."
venv/bin/python manage.py migrate

echo "Seeding data (skipped if already seeded)..."
venv/bin/python manage.py seed_data

echo "Starting server on http://localhost:8000"
venv/bin/python manage.py runserver 8000
