import { Formik, FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAppDispatch, RootState } from '../store';
import { loginUser } from '../store/authSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/layout/Navbar';
import { logout } from '../store/authSlice';

interface LoginFormValues {
    email: string;
    password: string;
}


const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();
    const initialValues: LoginFormValues = {
        email: '',
        password: ''
    };

    const navigate = useNavigate();
    const { isLogged, role } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isLogged && role) {
            if (role === 'postulante') {
                navigate('/verOfertasAll');
            } else if (role === 'empresa_oferente') {
                navigate('/verOfertasE');
            } else if (role === 'admin') {
                navigate('/inicioAdmin');
            } else if (role === 'empresa_gestora') {
                navigate('/inicioG');
            }
        }
    }, [isLogged, role, navigate]);

    const onSubmit = (values: LoginFormValues, { setSubmitting }: FormikHelpers<LoginFormValues>) => {
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor, espera mientras se procesa tu login.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading(Swal.getConfirmButton());
            }
        });
       
        dispatch(loginUser(values)).then((response) => {
            Swal.close();
             
            if (response.payload === "300") {
                Swal.fire({
                    icon: 'error',
                    title: 'Cuenta no verificada',
                    text: 'Tu cuenta no ha sido verificada. Revisa tu bandeja de entrada para continuar (Esto podria tomar unos minutos).',
                });
            }else if (response.payload === "403") {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.',
                });
            } else if (response.payload === "401") {
                Swal.fire({
                    icon: 'error',
                    title: 'Credenciales inválidas',
                    text: 'El usuario o contraseña ingresado no es correcto',
                });
                
            } else if (response.type === 'auth/loginUser/fulfilled') {
                const { user, role } = response.payload;
                const redirectTo = localStorage.getItem('redirectAfterLogin');
                if (redirectTo) {
                    localStorage.removeItem('redirectAfterLogin'); // Limpia la ruta guardada
                    navigate(redirectTo); // Redirige a la ruta guardada
                } else {
                   
              
                if (role === 'admin') {
                    navigate("/configuracion");
                } else if (role === 'postulante') {
                    if (user.first_login_at === null) {
                        navigate("/completar");
                    } else {
                        navigate("/verOfertasAll");
                    }
                } else if (role === 'empresa_oferente') {
                    if (user.first_login_at === null) {
                        navigate("/completare");
                    } else {
                        navigate("/verOfertasE");
                    }
                } else if (role === 'empresa_gestora') {
                    navigate("/inicioG");
                }else if (role === 'p_empresa_g') {
                    navigate("/inicioG");
                }
                else {
                    // Si el rol no es reconocido
                    dispatch(logout())
                    Swal.fire({
                      icon: "info",
                      title: "Usuario empresa gestora",
                      text: "Este usuario ha solicitado ser parte de la empresa gestora. Porfavor, espere hasta que la administración acepte su solicitud y pueda ingresar",
                    });
                }
            }
            }
        
            setSubmitting(false);
        }).catch(() => {
            Swal.close();
            setSubmitting(false);
        });
        
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('El correo no es válido')
            .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(es|ec|com)$/, 'El correo debe ser de un dominio que termine en .es, .ec o .com')
            .required('El correo es requerido'),
        password: Yup.string()
            .min(6, 'La contraseña debe ser minímo de 6 letras y números')
            .required('La contraseña es requerida'),
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row space-y-2">
            <Navbar />
            <div className="lg:w-7/12 xl:w-2/3 flex items-center justify-center">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
                    <div className="flex flex-col items-center">
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">Inicio de sesión</h2>
                    </div>
                    <h2 className="text-center italic">Ingrese sus credenciales a continuación:</h2>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        validationSchema={validationSchema}
                    >
                        {({
                            values,
                            errors,
                            handleChange,
                            handleSubmit,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.email && touched.email && (
                                            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={values.password}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>
                                        {errors.password && touched.password && (
                                            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-right">
                                    <a href="/EmailRequest" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                                <div className="text-center text-sm">
                                    <span>¿No tienes una cuenta? </span>
                                    <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Regístrate
                                    </a>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className="relative lg:w-5/12 xl:w-1/2 flex items-center justify-center overflow-hidden">
                <img className="object-cover h-screen w-full" src="/images/login.jpg" alt="Imagen" />
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
            </div>
        </div>
    );
}

export default Login;
