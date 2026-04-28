import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <div>
      <h1>VOYA Dispatch Console</h1>
      <p>Dobrodošao!</p>
      <button onClick={() => navigate('/profile')}>Moj profil</button>
      <button onClick={handleLogout}>Odjavi se</button>
    </div>
  );
}

export default HomePage;