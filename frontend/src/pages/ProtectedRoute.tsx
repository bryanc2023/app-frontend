import { useSelector } from "react-redux"
import { RootState } from "../store"
import { useNavigate } from "react-router-dom";
import {ReactNode, useEffect} from "react";

type Props = {
    children: React.ReactNode | ReactNode[];
    allowedRoles?: string[];
};
function ProtectedRoute({ children, allowedRoles = [] }: Props) {
    const { isLogged, role } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogged) {
            navigate('/login');
        } else if (role && !allowedRoles.includes(role)) {
            navigate('/unauthorized');
        }
    }, [isLogged, role, allowedRoles, navigate]);

  

    return <>{children}</>;
}

export default ProtectedRoute;