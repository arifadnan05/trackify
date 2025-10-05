# 🚀 Trackify

Trackify is a **modern issue tracking and project management platform** built with **Next.js 14 (App Router)**, **MongoDB**, and **TailwindCSS**.
It helps teams **create, assign, track, and resolve issues** efficiently while maintaining a smooth developer and user experience.

---

## ✨ Features

* 🔐 **Authentication & Authorization** (JWT, Middleware protected routes)
* 📝 **Issue Management** (Create, update, delete, assign)
* 📊 **Dashboard** with issue analytics
* 👥 **Role-based Access Control** (Admin, User)
* 🎨 **Modern UI** with TailwindCSS + ShadCN
* ⚡ **Optimized performance** with Next.js Server Actions & Caching
* ✅ **Validation** with Zod
* 🧪 **Unit & Integration Testing** using Vitest + Testing Library

---

## 🏗️ Tech Stack

* **Frontend:** Next.js 15+, React, TailwindCSS, ShadCN UI
* **Backend:** Next.js API Routes (Server Actions)
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT + Cookies + Middleware
* **Validation:** Zod
* **Testing:** Vitest, React Testing Library

---

## 📂 Project Structure

```
trackify/
│── app/                    # App Router (pages, API, layouts)
│── components/             # Reusable UI components
│── hooks/                  # Custom React hooks
│── lib/                    # DB connection, auth, validators
│── models/                 # Mongoose models (User, Issue)
│── utils/                  # Helpers & constants
│── tests/                  # Unit & integration tests
│── middleware.js           # JWT-based route protection
│── styles/                 # Global styles
│── .env.local              # Environment variables
```

---

## ⚙️ Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/arifadnan05/trackify.git
   cd trackify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set environment variables** in `.env.local`

   ```env
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_secret_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. Open in browser → [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

Run all tests:

```bash
npm run test
```

---

## 🚀 Deployment

Trackify can be deployed on **Vercel** or any Node.js hosting.
Make sure to configure environment variables in your hosting platform.

---

## 📌 Roadmap

* [ ] Notifications system
* [ ] Team collaboration (comments, mentions)
* [ ] Kanban board view
* [ ] Dark mode toggle

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a PR or issue.

---

## 📄 License

This project is licensed under the **MIT License** – free to use and modify.

---

### 👨‍💻 Author

**Arif Adnan**
Front-End Developer | Aspiring Full Stack Web Development
[Portfolio](https://arifadnan.netlify.app) | [GitHub](https://github.com/arifadnan05) | [LinkedIn](https://www.linkedin.com/in/arifadnan05)
