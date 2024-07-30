
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Postulante = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Postulante

