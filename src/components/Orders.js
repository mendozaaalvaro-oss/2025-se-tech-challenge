import { useState, useEffect, useRef } from "react";
import { Card, CardBody, CardTitle, Badge, Alert, Table } from "reactstrap";

export const OrdersComponent = ({ user, getIdTokenClaims, location }) => {

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const getOrdersFromToken = async () => {
      try {
        const freshClaims = await getIdTokenClaims();
        const ordersFromToken = freshClaims?.['https://pizza42/orders'] || [];
        setOrders(ordersFromToken);
      } catch (err) {
        if (user) {
          const ordersFromUser = user['https://pizza42/orders'] || [];
          setOrders(ordersFromUser);
        }
        setError(`Failed to get orders: ${err.message || err.error || 'Unknown error'}`);
      }
    };

    if (user && location.state?.refreshToken && !hasRefreshed.current) {
      hasRefreshed.current = true;
      getOrdersFromToken();
    } else if (user && !location.state?.refreshToken) {
      const ordersFromUser = user['https://pizza42/orders'] || [];
      setOrders(ordersFromUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state?.refreshToken]);

  return (
    <div className="mb-5">
      <h1>My Orders</h1>
      <p className="lead">View your order history</p>

      {error && (
        <Alert color="danger" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Alert color="info">
          <h4>No orders yet</h4>
          <p>You haven't placed any orders. Go to the home page to start ordering!</p>
        </Alert>
      ) : (
        <div>
          {orders.map((order, index) => (
            <Card key={order.orderNumber || index} className="mb-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <CardTitle tag="h5">Order #{order.orderNumber}</CardTitle>
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <Badge color={order.status === 'pending' ? 'warning' : 'success'}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                <Table size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="text-right">
                  <strong>Total: ${order.total}</strong>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
