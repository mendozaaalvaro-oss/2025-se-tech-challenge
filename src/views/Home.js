import { Fragment } from "react";
import { withRouter } from "react-router-dom";
import { withAuth0 } from "@auth0/auth0-react";

import Hero from "../components/Hero";
import { Content } from "../components/Content";

const Home = (props) => (
  <Fragment>
    <Hero />
    <hr />
    <Content {...props} />
  </Fragment>
);

export default withRouter(withAuth0(Home));
