# Project Tree

Generated file tree of the repository (node_modules omitted).

```
.
├── .env
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── prisma.config.ts
├── API_ENDPOINTS_COMPLETE_REFERENCE.md
├── DATA_MODELS_COMPLETE_REFERENCE.md
├── scripts/
│   └── test_endpoints.mjs
├── prisma/
│   ├── schema.prisma
│   ├── index.sql
│   ├── seed.js
│   └── migrations/
│       ├── 20251026143752_init/
│       │   └── migration.sql
│       ├── 20251026235029_expand_analytics_schema/
│       │   └── migration.sql
│       ├── 20251026235333_expand_analytics_schema/
│       │   └── migration.sql
│       ├── 20251028042453_front_end_model_changes/
│       │   └── migration.sql
│       └── 20251029021133_make_userid_optional/
│           └── migration.sql
├── src/
│   ├── server.js
│   ├── swagger/
│   │   ├── index.js
│   │   └── swagger.json
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── analytics.js
│   │   └── safeAnalytics.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── eventLogger.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── moodboards.js
│   │   └── admin/
│   │       ├── index.js
│   │       ├── auth.routes.js
│   │       ├── products.routes.js
│   │       ├── moodboards.routes.js
│   │       ├── utils.routes.js
│   │       ├── analytics.routes.js
│   │       └── analytics.full.routes.js
│   └── controllers/
│       └── admin/
│           ├── auth.controller.js
│           ├── users.controller.js
│           ├── products.controller.js
│           ├── moodboards.controller.js
│           ├── utils.controller.js
│           ├── analytics.controller.js
│           └── analytics.full.controller.js
├── utils/
│   ├── cloudinary.js
│   ├── jwt.js
│   ├── response.js
│   ├── upload.js
│   └── validate.js
├── uploads/
└── node_modules/ (omitted)
```

