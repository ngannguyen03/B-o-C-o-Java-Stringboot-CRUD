import api from './client';

export const paymentAPI = {
  createPayment: () => api.post('/payment/create'),
};

export default paymentAPI;
