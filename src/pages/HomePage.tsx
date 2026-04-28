import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const userJson = localStorage.getItem('currentUser');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <div>
      <h1>VOYA Dispatch Console</h1>
      <p>Dobrodošao, {currentUser?.firstName}!</p>

      <button onClick={() => navigate('/profile')}>Moj profil</button>

      {isAdmin && (
        <button onClick={() => navigate('/users')}>Svi korisnici</button>
      )}

      <button onClick={handleLogout}>Odjavi se</button>
    </div>
  );
}

export default HomePage;