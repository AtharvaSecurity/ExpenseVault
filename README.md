# ExpenseVault 

A modern, full-stack expense management platform built with React, NestJS, Prisma, and MySQL.

ExpenseVault helps users track expenses, manage categories, analyze spending patterns, and generate financial reports through a secure and responsive web application.

---

##  Features

### Authentication & Security

* JWT-based authentication
* User registration and login
* Password hashing with bcrypt
* Protected API routes
* Secure user profile management
* Password change functionality
* Input validation using DTOs and Zod schemas

###  Expense Management

* Create, update, and delete expenses
* Categorize expenses
* Search and filter transactions
* Sorting and pagination support
* Detailed expense tracking
* Responsive expense management interface

### 📊 Dashboard & Analytics

* Total expense overview
* Weekly spending summary
* Monthly spending summary
* Category-based expense breakdown
* Interactive charts and visualizations
* Recent transaction activity
* Spending trend analysis

### Categories

* Custom category creation
* Category color management
* Edit and delete categories
* Category analytics integration

### 📈 Reports & Export

* Monthly reports
* Weekly reports
* Category spending reports
* CSV export support
* PDF report generation
* Financial analytics dashboard

### 👤 User Management

* Profile updates
* Password management
* Account settings
* Personalized dashboard experience

###  User Experience

* Modern responsive interface
* Dark mode support
* Mobile-friendly design
* Loading states
* Toast notifications
* Clean dashboard layout

---

# 🏗️ Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* React Router
* Axios
* Tailwind CSS
* Recharts
* React Hook Form
* Zod

## Backend

* NestJS
* TypeScript
* Prisma ORM
* MySQL
* Passport JWT
* bcrypt
* class-validator
* class-transformer

## Infrastructure & DevOps

* Docker
* Docker Compose
* Nginx
* ESLint
* Prettier
* GitHub Actions (CI/CD Ready)

---

# 📂 Project Structure

```text
expensevault/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── expenses/
│       ├── categories/
│       ├── reports/
│       ├── prisma/
│       └── common/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── types/
│       └── utils/
│
├── docker-compose.yml
├── README.md
└── .github/
```

---

# 🚀 Quick Start

## Using Docker (Recommended)

Clone the repository:

```bash
git clone https://github.com/AtharvaSecurity/ExpenseVault.git
cd ExpenseVault
```

Start the complete application:

```bash
docker compose up -d --build
```

This launches:

| Service     | Port |
| ----------- | ---- |
| Frontend    | 5173 |
| Backend API | 3000 |
| MySQL       | 3306 |

Access the application:

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:3000/api/v1
```

---

# ⚙️ Local Development

## Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔧 Environment Variables

## Backend

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=mysql://expensevault:expensevault_password@localhost:3306/expensevault

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

## Frontend

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

# 🔌 API Modules

## Authentication

* Register User
* Login User
* Logout User
* Current User

## Users

* View Profile
* Update Profile
* Change Password

## Expenses

* Create Expense
* Update Expense
* Delete Expense
* List Expenses
* Dashboard Statistics
* Monthly Trends

## Categories

* Create Category
* Update Category
* Delete Category
* Category Analytics

## Reports

* Weekly Reports
* Monthly Reports
* CSV Export
* PDF Export

---

# 🛡️ Security

ExpenseVault follows modern backend security practices:

* JWT Authentication
* Password Hashing with bcrypt
* Request Validation
* Protected Routes
* Environment Variables
* Prisma Query Protection
* CORS Configuration
* Secure Error Handling

---

# 📦 Docker Support

Included:

* Frontend Dockerfile
* Backend Dockerfile
* Docker Compose Configuration
* MySQL Container
* Nginx Configuration

Start everything with:

```bash
docker compose up -d --build
```

Stop services:

```bash
docker compose down
```

Remove services and database volume:

```bash
docker compose down -v
```

---

# 🧪 Development Commands

Backend:

```bash
npm run lint
npm run test
npm run build
```

Frontend:

```bash
npm run lint
npm run build
```

---

# 🌟 Future Improvements

* Budget Tracking
* Recurring Expenses
* Multi-Currency Support
* Email Notifications
* Expense Forecasting
* Audit Logging
* PWA Support
* Advanced Financial Insights

---

# 🤝 Contributing

Contributions, feature requests, and improvements are welcome.

Fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

MIT License

---

Built with ❤️ by Atharva using React, NestJS, Prisma, MySQL, and Docker.
