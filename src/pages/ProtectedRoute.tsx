import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
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
    const [isVerifying, setIsVerifying] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Verificar si el token, isLogged o role son nulos
        if (!token || !isLogged || !role|| !user) {
            // Cerrar sesión y redirigir al login
             // Limpiar el almacenamiento local y de sesión
             localStorage.clear();
             sessionStorage.clear();
 
             // Opción adicional para borrar caches del navegador si es necesario:
             if ('caches' in window) {
                 caches.keys().then((names) => {
                     names.forEach((name) => {
                         caches.delete(name);
                     });
                 });
             }
 

            dispatch(logout());
            navigate("/login");
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

    // Mostrar un estado de "cargando" o redirigir mientras se verifica
    if (isVerifying) {
        return null; // O un componente de Loading
    }

    return <>{children}</>;
}

export default ProtectedRoute;
