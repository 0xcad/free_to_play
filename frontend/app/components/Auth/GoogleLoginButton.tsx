const onGoogleLoginSuccess = () => {
  const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const params = {
    response_type: 'code',
    client_id: '374054671164-5jcdb7a0g07g1h279nm3g7rlueluu4sb.apps.googleusercontent.com',
    redirect_uri: `http://localhost:5173/auth/`,
    prompt: 'select_account',
    access_type: 'offline',
    scope
  };

  const urlParams = new URLSearchParams(params).toString();
  window.location = `${GOOGLE_AUTH_URL}?${urlParams}`;
};


const GoogleLoginButton: React.FC = () => {
  return (
    <button onClick={onGoogleLoginSuccess}>Continue with Google</button>
  );
}

export default GoogleLoginButton;
