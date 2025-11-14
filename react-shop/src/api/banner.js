import api from "./client";

export const bannerAPI = {
  getAll: () => api.get("/banners"),
};

export default bannerAPI;
