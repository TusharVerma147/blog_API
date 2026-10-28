export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Blog API",
    version: "1.0.0",
    description:
      "REST API for a blog with Express, TypeScript and Mongoose. Auth uses an httpOnly cookie named `token` (set on login).",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Posts" },
    { name: "Comments" },
    { name: "Stats" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid email or password" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string" },
          authorName: { type: "string" },
          status: { type: "string", enum: ["draft", "published"] },
          commentCount: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          postId: { type: "string" },
          userId: { type: "string" },
          userName: { type: "string" },
          text: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 57 },
          totalPages: { type: "integer", example: 6 },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  message: "A user with this email already exists",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and set session cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in; `token` cookie is set",
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  message: "Invalid email or password",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and clear session cookie",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get logged-in user profile",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Current user (no password)" },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Unauthorized" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update logged-in user's name",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated user" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users/me/posts": {
      get: {
        tags: ["Users", "Posts"],
        summary: "List my posts (including drafts)",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "User posts" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "List published posts",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 50 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Case-insensitive title search",
          },
          {
            name: "tag",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "oldest", "mostCommented"],
              default: "newest",
            },
          },
        ],
        responses: {
          "200": {
            description: "Paginated published posts (body excluded)",
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "body"],
                properties: {
                  title: { type: "string", minLength: 5, maxLength: 120 },
                  body: { type: "string", minLength: 20 },
                  tags: {
                    type: "array",
                    maxItems: 5,
                    items: { type: "string" },
                  },
                  status: {
                    type: "string",
                    enum: ["draft", "published"],
                    default: "draft",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Post created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Get one published post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Published post" },
          "400": {
            description: "Invalid ObjectId",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Invalid post ID" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Post not found" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Posts"],
        summary: "Update a post (author only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  body: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  status: { type: "string", enum: ["draft", "published"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  message: "You are not allowed to update this post",
                },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete a post (author only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/posts/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "List comments for a published post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 50 },
          },
        ],
        responses: {
          "200": { description: "Paginated comments" },
          "404": { description: "Post not found" },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Add a comment to a published post",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", minLength: 1, maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Comment created" },
          "401": { description: "Unauthorized" },
          "404": { description: "Published post not found" },
        },
      },
    },
    "/api/comments/{id}": {
      delete: {
        tags: ["Comments"],
        summary: "Delete a comment (comment author or post author)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Blog statistics (single $facet aggregation)",
        responses: {
          "200": {
            description: "Stats payload",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        totalPublishedPosts: { type: "integer" },
                        topTags: { type: "array", items: { type: "object" } },
                        topAuthors: {
                          type: "array",
                          items: { type: "object" },
                        },
                        mostCommentedPosts: {
                          type: "array",
                          items: { type: "object" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
