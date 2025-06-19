# Zenshift Backend

A Node.js + TypeScript backend for the Zenshift platform, supporting authentication, user management, vertical content, product/order management, Stripe payments, file uploads, email, analytics, and full API documentation.

---

## Features

- **Authentication:** JWT-based registration, login, and user profile management
- **Verticals:** CRUD for Interiors, Abundance, Health, Apothecary content
- **Products & Orders:** Product catalog, order processing, Stripe payment integration
- **Files:** Secure file upload and digital product delivery
- **Email:** Send emails via free SMTP (Nodemailer)
- **Analytics:** Track page views, engagement, conversions
- **API Docs:** Swagger/OpenAPI at `/api-docs`
- **Security:** CORS, helmet, rate limiting, input validation
- **Environment:** .env-based config, dev/prod ready

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- (Optional) Stripe account for payments
- (Optional) SMTP credentials for email

### Installation

```bash
cd zenshift-backend
npm install
```

### Environment Variables

Copy `.env` and fill in your values:

```

```

### Running the Server

```bash
npx ts-node src/server.ts
```

The API will be available at `http://localhost:5000`.

---

## API Documentation

Interactive docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

All endpoints are documented with request/response schemas and authentication requirements.

---

## Key Endpoints

### Auth

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login, returns JWT

### Users

- `GET /api/users/me` — Get profile (JWT)
- `PUT /api/users/me` — Update profile (JWT)
- `DELETE /api/users/me` — Delete account (JWT)

### Verticals

- `GET/POST/PUT/DELETE /api/interiors`
- `GET/POST/PUT/DELETE /api/abundance`
- `GET/POST/PUT/DELETE /api/health`
- `GET/POST/PUT/DELETE /api/apothecary`

### Products & Orders

- `GET/POST/PUT/DELETE /api/store/products`
- `POST /api/orders` — Create order, Stripe payment intent
- `GET /api/orders/my` — User's orders (JWT)
- `GET/PUT/DELETE /api/orders/:id` — Order details/admin

### Files

- `POST /api/files/upload` — Upload file (JWT, multipart/form-data)
- `GET /api/files/:filename` — Download file

### Email

- `POST /api/email/send` — Send email

### Analytics

- `POST /api/analytics` — Record event (JWT)
- `GET /api/analytics` — Get all events

---

## Notes

- All protected endpoints require `Authorization: Bearer <JWT>` header.
- Stripe and email features require valid credentials in `.env`.
- File uploads are stored in `/uploads` and served at `/uploads/:filename`.

---

## License

MIT
