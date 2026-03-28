Tech Store (Next.js + HeroUI)

A modern full-stack e-commerce application built with Next.js 15, HeroUI, and Tailwind CSS, featuring authentication, admin dashboard, product search, notifications, and cart system.

Features
Product listing with filters & search
Live search with suggestions
Notifications system (Drawer UI)
Shopping cart
Authentication (NextAuth + JWT)
Admin dashboard (users, products, orders)
Dark / Light mode support
Fully responsive (mobile-first design)
Fast performance with Next.js App Router
Tech Stack
Framework: Next.js 15 (App Router)
UI Library: HeroUI v2
Styling: Tailwind CSS
State Management: Zustand
Authentication: NextAuth.js
Database: MongoDB + Mongoose
File Uploads: Cloudinary
Animations: Framer Motion
Charts: Recharts
Notifications: Custom Drawer system
Other Tools: Axios, bcryptjs, jsonwebtoken, nodemailer, slugify, xlsx
Installation

Clone the repository:

git clone https://github.com/your-username/tech-store.git
cd tech-store

Install dependencies:

npm install
Run the Project
Development server:
npm run dev

App runs on:

http://localhost:3000
Production build:
npm run build
npm start
Environment Variables

Create a .env file:

MONGODB_URI=your_mongodb_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

JWT_SECRET=your_jwt_secret
Project Structure
app/
components/
lib/
context/
services/
models/
public/
Notifications System
Built with HeroUI Drawer
Real-time update support (via state/API)
Badge counter for unread notifications
Admin Features
Manage products
Manage users
Manage orders
Dashboard analytics
Responsive Design
Mobile-first UI
Drawer navigation for mobile
Optimized layouts for all screens
Scripts
npm run dev
npm run build
npm run start
npm run lint
License

This project is licensed under the MIT License.

Author

Built by Omar Mohammed

If you like this project

Give it a star on GitHub and share it.