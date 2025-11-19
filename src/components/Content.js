import React, { Component } from "react";
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Alert, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import contentData from "../utils/pizzas";
import { sendVerificationEmail } from "../services/sendVerificationEmail";
import { handlePlaceOrder } from "../services/placeOrder";
import { refreshTokens } from "../services/refreshTokens";

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      orderSuccess: false,
      orderError: null,
      showEmailVerificationModal: false,
      sendingVerificationEmail: false,
      verificationEmailSent: false
    };
  }

  addToCart = (item) => {
    const { cart } = this.state;
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      this.setState({
        cart: cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      });
    } else {
      this.setState({
        cart: [...cart, { ...item, quantity: 1 }]
      });
    }
  };

  removeFromCart = (itemId) => {
    const { cart } = this.state;
    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem.quantity > 1) {
      this.setState({
        cart: cart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      });
    } else {
      this.setState({
        cart: cart.filter(cartItem => cartItem.id !== itemId)
      });
    }
  };

  calculateTotal = () => {
    const { cart } = this.state;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  handleSendVerificationEmail = async () => {
    const { auth0 } = this.props;
    this.setState({ sendingVerificationEmail: true });

    try {
      await sendVerificationEmail(auth0);
      this.setState({ sendingVerificationEmail: false, verificationEmailSent: true });
    } catch (err) {
      this.setState({ sendingVerificationEmail: false, orderError: 'Failed to send email' });
    }
  };

  handleRefreshAndRetry = async () => {
    const { auth0 } = this.props;

    try {
      const idTokenClaims = await auth0.getIdTokenClaims();
      const emailVerified = idTokenClaims?.email_verified;

      if (!emailVerified) {
        await refreshTokens(auth0);
      }

      this.setState({
        showEmailVerificationModal: false,
        orderError: null
      });

      await this.handlePlaceOrder();
    } catch (error) {
      this.setState({
        orderError: "Failed to refresh session. Please try logging out and back in.",
        showEmailVerificationModal: false
      });
    }
  };

  handlePlaceOrder = async () => {
    const { cart } = this.state;
    const { auth0, history } = this.props;

    try {
      await handlePlaceOrder(auth0, cart, this.calculateTotal, history);
      this.setState({ orderSuccess: true, cart: [], orderError: null });
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        this.setState({ showEmailVerificationModal: true, orderError: null });
      } else {
        this.setState({ orderError: err.message || 'Order failed' });
      }
    }
  };

  closeModal = () => {
    this.setState({ showEmailVerificationModal: false, verificationEmailSent: false });
  };

  renderLoginPrompt() {
    const { loginWithRedirect } = this.props.auth0;
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
  }

  renderVerificationModal() {
    const { showEmailVerificationModal, sendingVerificationEmail, verificationEmailSent } = this.state;

    return (
      <Modal isOpen={showEmailVerificationModal} toggle={this.closeModal}>
        <ModalHeader toggle={this.closeModal}>Email Verification Required</ModalHeader>
        <ModalBody>
          {verificationEmailSent && (
            <Alert color="success" className="verification-alert">
              <strong>Verification email sent!</strong> Please check your inbox and verify your email.
              After verifying, click "Refresh and Retry" below.
            </Alert>
          )}
          <p>You need to verify your email address before placing an order.</p>
          <p>Click "Send Verification Email".</p>
          <p>If you've already verified your email, click "Email Verification Completed" to update your session.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
          <Button color="info" onClick={this.handleRefreshAndRetry}>Email Verification Completed</Button>
          <Button color="primary" onClick={this.handleSendVerificationEmail} disabled={sendingVerificationEmail}>
            {sendingVerificationEmail ? "Sending..." : "Send Verification Email"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  renderMenuItem(item) {
    return (
      <Col key={item.id} md={6} className="mb-4">
        <Card className="menu-item-card">
          <CardBody className="menu-item-body">
            <CardTitle tag="h5">{item.title}</CardTitle>
            <CardText className="menu-item-description">{item.description}</CardText>
            <div className="menu-item-footer">
              <h4 className="menu-item-price">${item.price.toFixed(2)}</h4>
              <Button color="primary" onClick={() => this.addToCart(item)} size="sm">
                Add to Order
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  renderCart() {
    const { cart } = this.state;

    return (
      <div className="cart-container">
        <h3>Your Cart</h3>
        {cart.length === 0 ? (
          <p className="empty-cart-text">Your cart is empty</p>
        ) : (
          <>
            {cart.map((item) => this.renderCartItem(item))}
            <div className="cart-total-section">
              <div className="cart-total-row">
                <h4>Total:</h4>
                <h4>${this.calculateTotal()}</h4>
              </div>
              <Button color="success" size="lg" block onClick={this.handlePlaceOrder}>
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
  
   renderCartItem(item) {
    return (
      <div key={item.id} className="cart-item">
        <div className="cart-item-header">
          <div>
            <strong>{item.title}</strong>
            <Badge color="secondary" className="cart-item-quantity">x{item.quantity}</Badge>
          </div>
          <Button color="danger" size="sm" onClick={() => this.removeFromCart(item.id)}>
            Remove
          </Button>
        </div>
        <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    );
  }

  render() {
    const { isAuthenticated } = this.props.auth0;
    const { orderSuccess, orderError } = this.state;

    if (!isAuthenticated) {
      return this.renderLoginPrompt();
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
          <Alert color="danger" toggle={() => this.setState({ orderError: null })}>
            {orderError}
          </Alert>
        )}

        {this.renderVerificationModal()}

        <Row>
          <Col lg={8}>
            <Row>{contentData.map((item) => this.renderMenuItem(item))}</Row>
          </Col>
          <Col lg={4}>{this.renderCart()}</Col>
        </Row>
      </div>
    );
  }
}

export { Content };
