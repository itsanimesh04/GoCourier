import clientApi from '../apis/clientApi';

class OrderService {
  list() {
    return clientApi.get('/orders', { params: { page: 1, limit: 50 } });
  }

  getById(id: string) {
    return clientApi.get(`/orders/${id}`);
  }

  create(dropPoint: string) {
    return clientApi.post('/orders', { drop_point: dropPoint });
  }

  pay(orderId: string) {
    return clientApi.post(`/orders/${orderId}/pay`);
  }
}

export default new OrderService();
