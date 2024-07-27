import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from '../services/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';

type DataForm = {
    newPassword: string,
    confirmPassword: string
}

const PasswordResetForm = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const token = params.token!;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleResetPass = async (dataForm: DataForm) => {
        const data = { 
            token,
            password: dataForm.newPassword
        };
        try {
            const response = await axios.post('/reset-password', data);
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: response.data.message,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            
            navigate('/login');
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: error.response.data.message,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    };

    const { register, handleSubmit, formState: { errors }, watch } = useForm<DataForm>({ defaultValues: {
        newPassword: "",
        confirmPassword: ""
    }});

    const newPassword = watch('newPassword');

    return (
        <div>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4 text-center">Restablecer Contraseña</h1>
                    <form noValidate onSubmit={handleSubmit(handleResetPass)}>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-bold mb-2">
                                Nueva Contraseña:
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    placeholder="Nueva Contraseña"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    {...register("newPassword", {
                                        required: "La contraseña es requerida",
                                        pattern: {
                                            value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_(),.?":{}|<>]).{8,}$/,
                                            message: "La contraseña debe tener al menos una letra mayúscula, un número y un carácter especial"
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 p-2"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">
                                Confirmar Contraseña:
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="Confirmar Contraseña"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    {...register("confirmPassword", {
                                        required: "La confirmación de contraseña es requerida",
                                        validate: value => value === newPassword || "Las contraseñas no coinciden"
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 p-2"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className='flex justify-center'>
                            <input type='submit' className='bg-blue-700 text-white text-center py-3 px-5 rounded-lg shadow font-bold hover:bg-blue-500 w-full' value="Guardar cambios" />
                        </div>
                        {status && <p className="mt-4 text-center">{status}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetForm;
