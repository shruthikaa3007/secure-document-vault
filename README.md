# Secure Document Vault

A secure document management system with end-to-end encryption, role-based access control, AI-powered document intelligence, and comprehensive audit logging.

## Features

- **Secure Document Storage**: End-to-end encryption using AES-256-CBC
- **User Authentication**: JWT-based authentication with role-based access control
- **Document Management**: Upload, download, update, and delete documents
- **Access Control**: Role-based permissions and document-level access control
- **Audit Logging**: Comprehensive logging of all system actions
- **Admin Dashboard**: User management, system logs, and analytics
- **AI Capabilities**:
  - **Auto-tagging**: Automatically generate relevant tags using NLP
  - **Document Summarization**: Extract concise summaries from large documents
  - **Content Classification**: Classify documents based on sensitivity and department using ML
  - **Intelligent Search**: Semantic search support using AI-powered matching
  - **Anomaly Detection**: Detect suspicious document access patterns

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Multer for file uploads
- Crypto for encryption
- Python (via child process or microservice) for AI/NLP models (e.g., spaCy, transformers)
-HuggingFace Transformers (for summarization, classification)

### Frontend
- React
- Material-UI
- React Router
- Context API for state management
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Python 3.9+ (for AI microservices if used)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/secure-document-vault.git
   cd secure-document-vault
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the `backend` directory with the following:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/secure-document-vault
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   ENCRYPTION_KEY=12345678901234567890123456789012
   UPLOAD_DIR=uploads/
   ```

5. (Optional) Generate a secure encryption key:

   ```bash
   cd backend
   node utils/generateKey.js
   ```

6. Seed the database with initial roles:

   ```bash
   cd backend
   npm run seed
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:

   ```bash
   cd frontend
   npm start
   ```

3. Visit: `http://localhost:3000`

### Running AI Microservices 

For external Python-based AI services:

1. Set up a Python virtual environment and install dependencies:

   ```bash
   cd ai-
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Start the AI microservice (Flask/FastAPI):

   ```bash
   python auto_tagger_service.py
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/auth/profile`

### Documents
- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents/upload`
- `PUT /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/download`
- `GET /api/documents/search`
- `POST /api/documents/:id/share`
- `DELETE /api/documents/:id/share/:userId`

### AI (Optional)
- `POST /api/ai/summarize` – Generate summary
- `POST /api/ai/tag` – Auto-generate tags
- `POST /api/ai/classify` – Predict classification

### Admin
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Logs
- `GET /api/logs`
- `GET /api/logs/export`
- `GET /api/logs/exports`
- `GET /api/logs/exports/:filename`

## Security Considerations

- AES-256-CBC encryption for files
- JWT-based access tokens (1-hour expiration)
- bcrypt password hashing
- Input validation & sanitization (to prevent XSS, NoSQL injection)
- Rate limiting for authentication routes
- CORS restriction for frontend/backend isolation
- Helmet for secure HTTP headers

## License

This project is licensed under the MIT License – see the LICENSE file for details.
