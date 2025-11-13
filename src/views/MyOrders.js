import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import { OrdersComponent } from "../components/Orders";

const OrdersView = () => {
  const { user, getIdTokenClaims } = useAuth0();
  const location = useLocation();

  return (
    <OrdersComponent
      user={user}
      getIdTokenClaims={getIdTokenClaims}
      location={location}
    />
  );
};

export default withAuthenticationRequired(OrdersView, {
  onRedirecting: () => <Loading />,
});
