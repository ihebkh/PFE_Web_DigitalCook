// Login.jsx
// Page de connexion utilisateur (layout + formulaire)
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from './LoginForm';

/**
 * Page de connexion utilisateur (layout + formulaire).
 */
export default function Login() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}