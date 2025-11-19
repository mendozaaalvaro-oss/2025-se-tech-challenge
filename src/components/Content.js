import { useState, useCallback } from "react";
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Alert, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import contentData from "../utils/pizzas";
import { sendVerificationEmail } from "../services/sendVerificationEmail";
import { handlePlaceOrder } from "../services/placeOrder";
import { refreshTokens } from "../services/refreshTokens";

const Content = (props) => {
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);

      if (existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  }, []);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  }, [cart]);

  const handlePlaceOrderInternal = useCallback(async () => {
    const { auth0, history } = props;

    try {
      await handlePlaceOrder(auth0, cart, calculateTotal, history);
      setOrderSuccess(true);
      setCart([]);
      setOrderError(null);
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setShowEmailVerificationModal(true);
        setOrderError(null);
      } else {
        setOrderError(err.message || 'Order failed');
      }
    }
  }, [props, cart, calculateTotal]);

  const handleSendVerificationEmail = useCallback(async () => {
    const { auth0 } = props;
    setSendingVerificationEmail(true);

    try {
      await sendVerificationEmail(auth0);
      setSendingVerificationEmail(false);
      setVerificationEmailSent(true);
    } catch (err) {
      setSendingVerificationEmail(false);
      setOrderError('Failed to send email');
    }
  }, [props]);

  const handleRefreshAndRetry = useCallback(async () => {
    const { auth0 } = props;

    try {
      const idTokenClaims = await auth0.getIdTokenClaims();
      const emailVerified = idTokenClaims?.email_verified;

      if (!emailVerified) {
        await refreshTokens(auth0);
      }

      setShowEmailVerificationModal(false);
      setOrderError(null);

      await handlePlaceOrderInternal();
    } catch (error) {
      setOrderError("Failed to refresh session. Please try logging out and back in.");
      setShowEmailVerificationModal(false);
    }
  }, [props, handlePlaceOrderInternal]);

  const closeModal = useCallback(() => {
    setShowEmailVerificationModal(false);
    setVerificationEmailSent(false);
  }, []);

  const renderLoginPrompt = () => {
    const { loginWithRedirect } = props.auth0;
    return (
      <div className="login-prompt">
        <Alert color="info">
          <h4>Please log in to view our menu</h4>
          <p>You need to be authenticated to order pizzas.</p>
          <Button color="primary" onClick={() => loginWithRedirect()} className="mr-2">
            Log In with Password
          </Button>
          <Button color="success" onClick={() => loginWithRedirect({ authorizationParams: { connection: 'email' } })}>
            Login with One-Time Code
          </Button>
        </Alert>
      </div>
    );
  };

  const renderVerificationModal = () => {
    return (
      <Modal isOpen={showEmailVerificationModal} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Email Verification Required</ModalHeader>
        <ModalBody>
          {verificationEmailSent && (
            <Alert color="success" className="verification-alert">
              <strong>Verification email sent!</strong> Please check your inbox and verify your email.
              After verifying, click "Email Verification Completed" below.
            </Alert>
          )}
          <p>You need to verify your email address before placing an order.</p>
          <p>Click "Send Verification Email".</p>
          <p>If you've already verified your email, click "Email Verification Completed" to update your session.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModal}>Cancel</Button>
          <Button color="info" onClick={handleRefreshAndRetry}>Email Verification Completed</Button>
          <Button color="primary" onClick={handleSendVerificationEmail} disabled={sendingVerificationEmail}>
            {sendingVerificationEmail ? "Sending..." : "Send Verification Email"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  const renderMenuItem = (item) => {
    return (
      <Col key={item.id} md={6} className="mb-4">
        <Card className="menu-item-card">
          <CardBody className="menu-item-body">
            <CardTitle tag="h5">{item.title}</CardTitle>
            <CardText className="menu-item-description">{item.description}</CardText>
            <div className="menu-item-footer">
              <h4 className="menu-item-price">${item.price.toFixed(2)}</h4>
              <Button color="primary" onClick={() => addToCart(item)} size="sm">
                Add to Order
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  };

  const renderCart = () => {
    return (
      <div className="cart-container">
        <h3>Your Cart</h3>
        {cart.length === 0 ? (
          <p className="empty-cart-text">Your cart is empty</p>
        ) : (
          <>
            {cart.map((item) => renderCartItem(item))}
            <div className="cart-total-section">
              <div className="cart-total-row">
                <h4>Total:</h4>
                <h4>${calculateTotal()}</h4>
              </div>
              <Button color="success" size="lg" block onClick={handlePlaceOrderInternal}>
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCartItem = (item) => {
    return (
      <div key={item.id} className="cart-item">
        <div className="cart-item-header">
          <div>
            <strong>{item.title}</strong>
            <Badge color="secondary" className="cart-item-quantity">x{item.quantity}</Badge>
          </div>
          <Button color="danger" size="sm" onClick={() => removeFromCart(item.id)}>
            Remove
          </Button>
        </div>
        <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    );
  };

  const { isAuthenticated } = props.auth0;

  if (!isAuthenticated) {
    return renderLoginPrompt();
  }

  return (
    <div>
      <h2 className="menu-header">Our Menu</h2>
      <p className="menu-subtitle">Choose from our selection of pizzas</p>

      {orderSuccess && (
        <Alert color="success">
          Order placed successfully! Redirecting to My Orders...
        </Alert>
      )}

      {orderError && (
        <Alert color="danger" toggle={() => setOrderError(null)}>
          {orderError}
        </Alert>
      )}

      {renderVerificationModal()}

      <Row>
        <Col lg={8}>
          <Row>{contentData.map((item) => renderMenuItem(item))}</Row>
        </Col>
        <Col lg={4}>{renderCart()}</Col>
      </Row>
    </div>
  );
};

export { Content };
