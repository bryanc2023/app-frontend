import { Link, Outlet } from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import "../css/Navbar.css"

function Navbar() {

    const { isLogged } =  useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();


  return (
    <>
      <header className="bg-gray-800 p-4 flex justify-between items-center fixed w-full z-10">
        <h1 className="text-white text-2xl font-bold">
          <Link to='/'>Postula</Link>
        </h1>
        <nav className="flex gap-4">
          {isLogged ? (
            <Link to="/" onClick={() => dispatch(logout())} className="text-white hover:underline">Logout</Link>
          ) : (
            <>
              <Link to='/login' className="text-white hover:underline">Iniciar sesión</Link>
              <Link to='/registro' className="text-white hover:underline">Registrarse</Link>
            </>
          )}
        </nav>
      </header>
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}

export default Navbar