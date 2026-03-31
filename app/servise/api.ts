import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const authAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const attachToken = (config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
};

authAPI.interceptors.request.use(attachToken);
uploadAPI.interceptors.request.use(attachToken);

export const api = {
  auth: {
    login: (data: any) => authAPI.post("/api/auth/login", data),
    register: (data: any) => authAPI.post("/api/auth/register", data),
    googleLogin: () => authAPI.post("/api/auth/google-login"),
    forgotPassword: (email: any) => authAPI.post("/api/auth/forgot-password", email),
    resetPassword: (data: any) => authAPI.post("/api/auth/reset-password", data),
    logout: () => authAPI.post("/api/auth/logout"),
  },
  users: {
    getAll: () => authAPI.get("/api/users"),
    create: (data: any) => authAPI.post("/api/users", data),
    update: (data: any) => authAPI.put("/api/users", data),
    delete: (email: any) => authAPI.delete("/api/users", { data: { email } }),
  },
  notifications: {
    getAll: (userId: any) => authAPI.get(`/api/notifications`, { headers: { userid: userId } }),
    create: (data: any) => authAPI.post("/api/notifications", data),
  },
  products: {
    getAll: (query?: string) => authAPI.get(`/api/products?${query}`),
    getProductById: (id: any) => authAPI.get(`/api/products/${id}`),
    create: (data: any) => uploadAPI.post("/api/products", data),
    update: (id: any, data: any) => authAPI.put(`/api/products/edit/${id}`, data),
    delete: (id: any) => authAPI.delete(`/api/products/edit/${id}`),
  },
  categories: {
    getAll: () => authAPI.get("/api/categories"),
    create: (data: any) => authAPI.post("/api/categories", data),
  },
  sales : {
    getAll: () => authAPI.get("/api/sales")
  },
  orders: {
    getAll: () => authAPI.get("/api/orders"),
    getByUser: (userId: any) => authAPI.get(`/api/orders/user/${userId}`),
    create: (data: any) => authAPI.post("/api/orders", data),
    update: (data: any) => authAPI.put("/api/orders", data),
    delete: (id: any) => authAPI.delete(`/api/orders/${id}`),
  },
  favorites: {
    getAll: (userId: any) => authAPI.get(`/api/favorites`, { headers: { userid: userId } }),
    create: (data: any) => authAPI.post("/api/favorites", data),
    delete: (productId: any, userId: any) => authAPI.delete(`/api/favorites?id=${productId}`, { headers: { userid: userId } }),
  },
  rating : {
    getAll : (productId: any) => authAPI.get(`/api/rating`,{params: { product: productId },}),
    create: (data: any) => authAPI.post("/api/rating", data),
  },
  search : {
    search: (query: any) => authAPI.get("/api/products/search", { params: { query } }),
  }
};

export default api;