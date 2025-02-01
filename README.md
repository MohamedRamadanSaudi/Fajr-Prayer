# Fajr Prayer Tracker

## Overview

The **Fajr Prayer Tracker** is a side project developed to help my friends and me stay consistent with our Fajr prayers. It serves as the backend for a **Flutter mobile app** and a **React admin dashboard**. The backend is built using **NestJS** and provides APIs for user management, prayer tracking, and admin functionalities.

This project is a personal initiative to encourage accountability and consistency in our spiritual practices. It is a meaningful tool for us to support each other in maintaining discipline.

---

## Features

### For Mobile App (Flutter):

- **User Authentication**:

  - Users can register and log in.
  - JWT-based authentication for secure access.

- **Prayer Tracking**:

  - Users can log their Fajr prayer attendance for the day.
  - Users can upload a photo as proof of their attendance (optional).
  - Users earn points for waking up on time and praying in the mosque.

- **Leaderboard**:

  - Users can view their rank based on points earned.

- **Profile Management**:
  - Users can update their profile, including uploading a profile photo.
  - Users can view their points, total missed prayers, and prayer history.

### For Admin Dashboard (React):

- **Admin Authentication**:

  - Admins can log in to manage users and prayer records.

- **User Management**:

  - Admins can create, update, and delete user accounts.
  - Admins can view all users and their details.

- **Prayer Record Management**:

  - Admins can manually log prayer attendance for users.
  - Admins can view, update, and delete prayer records.

- **Data Reset**:
  - Admins can reset all data (for testing purposes).

### Backend Features:

- **Automated Daily Tracking**:

  - A cron job automatically creates default entries for users who haven't logged their attendance by sunrise.

- **Image Upload**:

  - Integration with **Cloudinary** for handling profile photos and proof images.

- **Database**:
  - **MongoDB** for storing user and prayer data.
  - **Prisma** as the ORM for database management.

---

## Technologies Used

- **Backend**:

  - [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications.
  - [Prisma](https://www.prisma.io/) - A modern database toolkit for TypeScript and Node.js.
  - [MongoDB](https://www.mongodb.com/) - A NoSQL database used for storing user and prayer data.
  - [Cloudinary](https://cloudinary.com/) - A cloud-based image and video management service for handling profile photos and proof images.

- **Authentication**:

  - [JWT (JSON Web Tokens)](https://jwt.io/) - Used for secure user authentication.

- **Cron Jobs**:

  - [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) - Used for scheduling automated tasks, such as creating default entries for missed prayers.

- **Deployment**:
  - GitHub Actions - Used for CI/CD to deploy the application to a VPS.

---

## Getting Started

### Prerequisites

- Node.js (v18.x)
- npm (v9.x)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MohamedRamadanSaudi/Fajr-Prayer.git
   cd Fajr-Prayer
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   DATABASE_URL=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   ADMIN_PASSWORD=your-admin-password
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   DEFAULT_PHOTO_URL=your-default-photo-url
   ```

4. **Run database migrations**:

   ```bash
   npx prisma db push
   ```

5. **Start the application**:

   ```bash
   npm run start:dev
   ```

6. **Access the API**:
   The API will be available at `http://localhost:3000`.

---

## API Endpoints

### User Endpoints

- **POST /user** - Create a new user.
- **GET /user** - Get all users (ranked by points).
- **GET /user/me** - Get the current user's profile and rank.
- **PATCH /user/:id** - Update a user's profile.
- **DELETE /user/:id** - Delete a user.

### Prayer Tracking Endpoints

- **POST /days** - Log Fajr prayer attendance for the current user.
- **POST /days/admin** - Log Fajr prayer attendance for a user (admin only).
- **GET /days** - Get all prayer records.
- **PATCH /days/:id** - Update a prayer record.
- **DELETE /days/:id** - Delete a prayer record.

### Admin Endpoints

- **POST /admin** - Create an admin account.
- **POST /auth/admin-login** - Log in as an admin.

### Authentication Endpoints

- **POST /auth/user-login** - Log in as a user.

---

## Automated Daily Tracking

A cron job runs every day at 6:50 AM (Cairo time) to create default entries for users who haven't logged their Fajr prayer attendance by sunrise. This ensures that all users are accounted for, even if they forget to log their attendance manually.

---

## Deployment

The application is deployed using **GitHub Actions**. The workflow automatically deploys the application to a VPS whenever changes are pushed to the `main` branch.

### Deployment Steps:

1. Push changes to the `main` branch.
2. GitHub Actions will:
   - Pull the latest changes.
   - Run database migrations.
   - Install dependencies.
   - Build the application.
   - Restart the application using PM2.

---

## Contributing

Contributions are welcome!

---

## Contact

If you have any questions or feedback, feel free to reach out:

- **Email**: MohamedRamadanSaudi@gmail.com
- **GitHub**: [Mohamed Ramadan](https://github.com/MohamedRamadanSaudi)

---

**May this project help us all stay consistent in our prayers and grow closer to Allah.** 🌙
