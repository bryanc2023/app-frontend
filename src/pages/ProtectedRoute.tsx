import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { logout } from "../store/authSlice";

type Props = {
    children: React.ReactNode | ReactNode[];
    allowedRoles?: string[];
};

function ProtectedRoute({ children, allowedRoles = [] }: Props) {
    const { isLogged, role } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Si la ruta es "/perfilP", no se ejecuta la redirección o cierre de sesión
        if (location.pathname === "/perfilP" || location.pathname === "/PerfilE" || location.pathname === "/PerfilG") {
            setIsVerifying(false); // Marcar como verificado para evitar que muestre un estado de carga
            return;
        }
        // Verificar si el token, isLogged o role son nulos
        if (!token || !isLogged || !role || !user) {
            // Cerrar sesión y redirigir al login
            logoutAndRedirect();
            return;
        }

        // Verificar si el rol permitido está incluido
        if (role && !allowedRoles.includes(role)) {
            navigate("/unauthorized");
            return;
        }

        // Si todo está bien, marcar como verificado
        setIsVerifying(false);
    }, [isLogged, role, allowedRoles, navigate, dispatch]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Solo cerrar sesión si se está saliendo de la pestaña
            if (location.pathname !== "/perfilP" && location.pathname !== "/PerfilE" && location.pathname !== "/PerfilG" ) {
                // Para permitir un mensaje, aunque no funcione en todos los navegadores
                event.preventDefault();
                event.returnValue = ""; // Algunos navegadores requieren esto
                // Aquí no se cierra sesión, solo se avisa que se va a cerrar la pestaña
            }
        };

        // Agregar el listener al evento beforeunload
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            // Limpiar el listener cuando el componente se desmonta
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [location]);

   
    const logoutAndRedirect = () => {
        // Limpiar el almacenamiento local y de sesión
        localStorage.clear();
        sessionStorage.clear();

        // Despachar la acción de logout
        dispatch(logout());
        navigate("/login");
    };

    // Mostrar un estado de "cargando" o redirigir mientras se verifica
    if (isVerifying) {
        return null; // O un componente de Loading
    }

    return <>{children}</>;
}

export default ProtectedRoute;
