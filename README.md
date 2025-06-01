# Fair Game Reviews

A platform for reviewing games with a focus on fair pricing.

## Features

- Game reviews with fair price recommendations
- Admin dashboard for managing reviews
- Secure authentication
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-admin-password"
```

3. Initialize the database:
```bash
npx prisma migrate reset
```

4. Start the development server:
```bash
npm run dev
```

## Development

- Built with Next.js 14
- Uses Prisma for database management
- Implements secure password hashing using SHA-256
- Uses SQLite for development (can be changed to PostgreSQL for production)

## License

MIT

## Getting Started

### Security Notes

#### Admin Authentication
- Passwords are securely hashed using bcrypt
- Default admin password is 'admin' (CHANGE THIS IN PRODUCTION)
- To generate a new password hash:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
  ```
- Required environment variable:
  ```
  ADMIN_PASSWORD_HASH=your_generated_bcrypt_hash
  ```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
