import axios from "axios";

// =======================
// ⚙️ CẤU HÌNH CHUNG
// =======================
const API_BASE_URL = "http://localhost:8080/api";

// ✅ Tạo instance axios dùng chung
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 giây để tránh treo request
});

// =======================
// 🧩 INTERCEPTOR REQUEST
// =======================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    // ✅ Chỉ log khi ở môi trường phát triển
    if (process.env.NODE_ENV === "development") {
      console.log("🟢 [Request URL]:", config.baseURL + config.url);
      if (config.method?.toUpperCase() === "POST")
        console.log("📦 [Request Body]:", config.data);
      console.log("🔐 [Access Token]:", token || "(none)");
    }

    // ⚠️ CHỈ gắn JWT khi gọi API (tránh ảnh hoặc static file)
    if (token && config.url?.startsWith("/")) {
      // Chỉ thêm token cho các route bắt đầu bằng /api/
      if (config.url.startsWith("/api/")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request setup error:", error);
    return Promise.reject(error);
  }
);

// =======================
// 🧩 INTERCEPTOR RESPONSE
// =======================
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("🟩 [Response OK]:", response.status, response.config.url);
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.error("🚨 [Response Error]:", status, error.response?.data);

    // ✅ Nếu lỗi 401 (token hết hạn) và chưa retry → refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        console.warn("♻️ Token expired → trying refresh-token flow...");

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken } = res.data;

        console.log("🆕 [New accessToken received]");
        localStorage.setItem("accessToken", accessToken);

        // ✅ Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log("🔄 Retrying original request:", originalRequest.url);
        return api(originalRequest);
      } catch (err) {
        console.error(
          "❌ Refresh-token failed:",
          err.response?.data || err.message
        );
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // ❌ Nếu lỗi khác 401 thì hiển thị log cảnh báo
    if (status === 403) {
      console.warn("🚫 Access denied — thiếu quyền truy cập!");
    } else if (status === 404) {
      console.warn("❓ API not found:", originalRequest?.url);
    } else if (!status) {
      console.error("🌐 Network error hoặc server offline");
    }

    return Promise.reject(error);
  }
);

// =======================
// ✅ EXPORT CHÍNH
// =======================
export default api;
