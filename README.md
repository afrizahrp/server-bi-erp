Sales Dashboard API

A RESTful API built with NestJS to power a multi-company sales dashboard. This backend provides secure, scalable endpoints for managing sales data, enabling real-time analytics and multi-tenant support for businesses.
🎯 Project Overview
The Sales Dashboard API was developed to support a Next.js-based sales dashboard by providing efficient data management for multiple companies. It addresses the challenge of fragmented sales reporting by offering:

Multi-tenant architecture: Isolated data for each company.
Real-time data access: Fast, secure endpoints for sales metrics.
Scalable design: Ready for microservices integration with RabbitMQ and Kubernetes.
Secure authentication (planned): JWT-based access control.

This project showcases my expertise in backend development with NestJS, Node.js, and modern DevOps tools, complementing my skills in Golang and Next.js.
🛠️ Technologies Used

Framework: NestJS (Node.js, TypeScript)
Database: PostgreSQL for data storage
Message Queue (planned): RabbitMQ for async event handling
DevOps (planned): Docker for containerization, Kubernetes for orchestration
Testing: Jest for unit and e2e tests
Frontend Integration: Compatible with Next.js sales dashboard

🚀 Getting Started
Prerequisites

Node.js (v18 or higher)
npm or yarn
PostgreSQL (v14 or higher)
Git

Installation

Clone the repository:git clone https://github.com/your-username/sales-dashboard-api.git
cd sales-dashboard-api

Install dependencies:npm install

# or

yarn install

Set up environment variables in .env:DATABASE_URL=postgresql://user:password@localhost:5432/sales_db
PORT=3000

Run database migrations (if applicable):npm run migration:run

Start the development server:npm run start:dev

Access the API at http://localhost:3000/api.

API Endpoints

GET /sales: Retrieve sales data for a specific tenant.
POST /sales: Create a new sales record.
GET /metrics: Fetch aggregated sales metrics (e.g., revenue, trends).
(See API documentation for full details, planned.)

📸 Screenshots
Sample JSON response for sales metrics.
Planned microservices architecture with RabbitMQ and K8s.
🌟 Features

Multi-tenant data isolation: Securely manage sales data for multiple companies.
RESTful endpoints: Fast and reliable API for frontend integration.
Scalable architecture: Designed for high-traffic applications.
Event-driven design (planned): Async processing with RabbitMQ.
Containerized deployment (planned): Docker and Kubernetes support.

🧪 Running Tests

# Unit tests

npm run test

# End-to-end tests

npm run test:e2e

# Test coverage

npm run test:cov

📖 Learn More

Explore the code in this GitHub repository.
Check out my other projects: Microservices with Golang & K8s.
Read about NestJS for technical details.

🚧 Future Improvements

Implement JWT authentication for secure access.
Add RabbitMQ for real-time event handling (e.g., sales notifications).
Containerize with Docker and deploy to Kubernetes.
Generate Swagger/OpenAPI documentation for endpoints.
Enhance test coverage with more edge cases.

🤝 Contributing
Feedback and contributions are welcome! Please:

Open an issue for bugs or suggestions.
Submit a pull request with improvements.

📬 Contact
I’m a backend developer passionate about scalable solutions with NestJS, Node.js, Golang, and DevOps. Connect with me:

LinkedIn: https://www.linkedin.com/in/afriza-harahap
Email: afriza.harahap@gmail.com

Interested in remote backend projects? Let’s discuss!
📝 License
This project is licensed under the MIT License.

Built with 💻 by Afriza Harahap
