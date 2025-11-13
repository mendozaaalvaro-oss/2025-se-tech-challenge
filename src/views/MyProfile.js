import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { ProfileComponent } from "../components/Profile";

const ProfileView = () => {
  const { user, getAccessTokenSilently, getIdTokenClaims } = useAuth0();

  return (
    <ProfileComponent
      user={user}
      getAccessTokenSilently={getAccessTokenSilently}
      getIdTokenClaims={getIdTokenClaims}
    />
  );
};

export default withAuthenticationRequired(ProfileView, {
  onRedirecting: () => <Loading />,
});
