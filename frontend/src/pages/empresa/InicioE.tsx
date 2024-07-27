import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

function InicioE() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
   <>
   <div></div>
   </>
  );
}

export default InicioE