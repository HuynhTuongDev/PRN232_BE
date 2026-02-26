# GoRide - Backend

Backend API for the GoRide platform, built with NestJS and Prisma.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file from `.env.example` and update the `DATABASE_URL`.

3.  **Setup Database**:
    ```bash
    npm run prisma:generate
    npm run prisma:migrate
    ```

4.  **Run Development**:
    ```bash
    npm run start:dev
    ```

## Project Structure

- `src/`: Core backend logic (formerly in api-gateway)
- `libs/shared/`: Shared types and utilities
- `prisma/`: Database schema and migrations
