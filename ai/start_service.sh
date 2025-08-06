#!/bin/bash
# Start the AI auto-tagger service

echo "Starting AI Auto-Tagger Service..."
cd "$(dirname "$0")"
python auto_tagger_service.py
