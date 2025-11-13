import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "reactstrap";
import { resetPassword } from "../services/resetPassword";

export const ProfileComponent = ({ user, getAccessTokenSilently, getIdTokenClaims }) => {
  const [resetting, setResetting] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [idToken, setIdToken] = useState(null);

  const displayUser = user ? { ...user } : {};
  delete displayUser['https://pizza42/orders'];

  useEffect(() => {
    const fetchIdToken = async () => {
      try {
        const idTokenClaims = await getIdTokenClaims();
        setIdToken(idTokenClaims?.__raw);
      } catch (error) {
        console.error('Error fetching ID token:', error);
      }
    };

    if (user) {
      fetchIdToken();
    }
  }, [user, getIdTokenClaims]);

  const handlePasswordReset = async () => {
    setResetting(true);
    setResetError(null);
    setResetInfo(null);

    try {
      const data = await resetPassword({ getAccessTokenSilently });
      setResetInfo(data);
    } catch (err) {
      setResetError('Failed to reset password');
    }

    setResetting(false);
  };

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
          <Button
            color="primary"
            onClick={handlePasswordReset}
            disabled={resetting}
            className="mt-2"
          >
            {resetting ? "Sending..." : "Reset Password"}
          </Button>
        </Col>
      </Row>

      {resetInfo && (
        <Alert color="success" className="mb-4">
          <h5 className="alert-heading">Password Reset Email Sent</h5>
          <hr />
          <p className="mb-1"><strong>Message:</strong> {resetInfo.message}</p>
          <p className="mb-1"><strong>Email sent to:</strong> {resetInfo.email}</p>
        </Alert>
      )}

      {resetError && (
        <p className="text-danger mb-4">{resetError}</p>
      )}

      <Row>
        <Col>
          <h4 className="mb-3">User Profile</h4>
          <pre className="rounded p-3 bg-light">
            <code>{JSON.stringify(displayUser, null, 2)}</code>
          </pre>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h4 className="mb-3">ID Token</h4>
          <pre className="rounded p-3 bg-light" style={{ fontSize: '0.75rem', maxHeight: '300px', overflow: 'auto' }}>
            <code>{idToken || 'Loading...'}</code>
          </pre>
        </Col>
      </Row>

    </Container>
  );
};
