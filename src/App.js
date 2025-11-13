import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import { NavBar } from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/MyProfile";
import Orders from "./views/MyOrders";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

import "./App.css";

const App = () => {
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar
          user={user}
          isAuthenticated={isAuthenticated}
          loginWithRedirect={loginWithRedirect}
          logout={logout}
        />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={Orders} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
