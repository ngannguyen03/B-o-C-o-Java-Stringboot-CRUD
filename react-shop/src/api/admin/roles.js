import api from '../client';

export const adminRolesAPI = {
  getAll: () => api.get('/admin/roles'),
  create: (roleData) => api.post('/admin/roles', roleData),
  update: (id, roleData) => api.put(`/admin/roles/${id}`, roleData),
  delete: (id) => api.delete(`/admin/roles/${id}`),
};

export default adminRolesAPI;
