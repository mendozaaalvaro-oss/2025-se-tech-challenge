import { Fragment } from "react";
import { useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Hero from "../components/Hero";
import { Content } from "../components/Content";

const Home = () => {
  const auth0Props = useAuth0();
  const history = useHistory();

  return (
    <Fragment>
      <Hero />
      <hr />
      <Content auth0={auth0Props} history={history} />
    </Fragment>
  );
};

export default Home;
