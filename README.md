# ⚡ E-Commerce Inventory & Warehouse Platform

[![Java](https://img.shields.io/badge/Java-25-orange.svg?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![Testcontainers](https://img.shields.io/badge/Tested%20with-Testcontainers-black.svg?logo=testcontainers)](https://testcontainers.com/)

A full-stack e-commerce inventory and warehouse management system built with **Spring Boot 4**, **PostgreSQL**, and **React**.

The project demonstrates production-ready backend design: transactional inventory management (ACID), clean layered architecture, containerized integration testing, and an interactive dual-view UI.

---

## 🚀 Key Features

- **Dual-View Web Interface (React):**
  - **🛍️ Client Storefront:** Browse catalog, select item quantities, and execute purchases with real-time stock deduction.
  - **📦 Warehouse Dashboard:** Live inventory stats, custom delivery restocking (`PUT`), product deletion (`DELETE`), catalog creation (`POST`), and low-stock filtering.
- **ACID Transaction Management:** Purchase logic runs under `@Transactional`, preventing race conditions and negative inventory levels with dedicated exception handling.
- **Optimized Database Layer:**
  - PostgreSQL `SEQUENCE` generator configured for efficient JDBC batching.
  - Custom JPQL query to filter low-stock items (`stockQuantity < threshold`).
- **Comprehensive Testing Suite:**
  - **Unit tests:** Mockito & AssertJ verifying business domain logic in isolation.
  - **Integration tests:** **Testcontainers PostgreSQL** & **REST Assured** testing HTTP endpoints against a real database container.

---

## 🛠️ Tech Stack

- **Backend:** Java 25, Spring Boot 4, Spring Data JPA, Hibernate, MapStruct, Lombok
- **Database:** PostgreSQL (managed with Docker Compose)
- **Frontend:** React, Vite, Modern CSS
- **Testing:** JUnit 5, Mockito, AssertJ, Testcontainers, REST Assured

---

## 📡 REST API Endpoints

Base path: `/api/products`

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products | `200 OK` |
| `GET` | `/api/products/{id}` | Get product details by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/products` | Create a new product | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/products/{id}` | Update product / Restock inventory | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/products/{id}` | Delete product from database | `204 No Content` / `404 Not Found` |
| `POST` | `/api/products/{id}/purchase` | Purchase specified quantity (decrements stock) | `200 OK` / `400 OutOfStock` |
| `GET` | `/api/products/low-stock` | Filter low-stock products (custom JPQL query) | `200 OK` |

---

## 🏁 Quickstart

### 1. Start Database (Docker)
```bash
docker compose up -d
```

### 2. Run Backend (Spring Boot)
```bash
./mvnw spring-boot:run
```
*API will run at `http://localhost:8080`*

### 3. Run Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*Application will open at `http://localhost:5173`*

### 4. Run Tests
```bash
./mvnw clean test
```
