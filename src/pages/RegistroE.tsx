import { Formik } from 'formik';

import InputLabel from '../components/input/InputLabel';
import Button from '../components/input/Button';
import * as Yup from 'yup';
import { Api } from '../services/api';
import Swal from 'sweetalert2';
import  "../assets/css/RegistroP.css"
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';

function RegistroE() {
    const [isLoading] = useState(false);
    const initialValues={
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    };

    const onSubmit = (values:typeof initialValues)=>{
        console.log(values);
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor, espera mientras se procede al registro',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading(Swal.getConfirmButton());
            }
        });
        Api.post('/auth/registerE', values)
            .then((response) => {
                Swal.close(); // Cerrar el mensaje de "cargando"
                console.log(response);
                // Si la respuesta indica un registro exitoso, muestra la alerta de SweetAlert
               
                if (response.statusCode === 201) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Usuario registrado!',
                        text: 'Revise su correo para continuar con el registro completo de sus datos, por favor.',
                    }).then(() => {
                        // Después de hacer clic en OK, redirige al usuario a "/"
                        window.location.href = "/";
                    });
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: '¡Error!',
                        text: "El correo electronico ingresado ya esta registrado",
                    });
                }
                
            })
           
    }

    const validationSchema = Yup.object({
       name:Yup.string().required('El nombre de usuario es requerido'),
       email:Yup.string().email('El correo no es válido')
              .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(es|ec|com)$/, 'El correo debe ser de un dominio que termine en .es , ec o .com').required('El correo es requerido'),
       password:Yup.string().min(6,'La contraseña debe ser minímo de 6 letras y números').required('La contraseña es requerida'),
       password_confirmation:Yup.string().oneOf([Yup.ref('password')],'Las contraseñas no coinciden').min(6,'La contraseña debe ser minímo de 6 letras y números').required('La comprobación de contraseña es requerida'),
    });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row space-y-2" >
        <Navbar />
         {isLoading && (
                <div className='loader-container'>
                    <div className="loader"></div>
                    <div className='loading-text'>Procesando, Espere porfavor...</div>
                </div>
            )}
        <div className="lg:w-7/12 xl:w-2/3 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registro de Empresa </h2>
                </div>
                <h2 className="text-center italic">"¿Listo para encontrar nuevos candidatos?"</h2>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        validationSchema={validationSchema}>
                            {({
                                values,
                                errors,
                                handleChange,
                                handleSubmit,
                            }) => (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <InputLabel label="Nombre de usuario" name="name" id="name" placeholder="Nombre de usuario" error={errors.name} onChange={handleChange} value={values.name}/>
                            <InputLabel label="Correo" name="email" id="email" placeholder="Correo Electrónico" type="email"error={errors.email} onChange={handleChange} value={values.email}/>
                            <InputLabel label="Contraseña" name="password" id="password" placeholder="Contraseña" type="password"error={errors.password} onChange={handleChange} value={values.password}/>
                            <InputLabel label="Confirmar Contraseña" name="password_confirmation" id="password_confirmation" placeholder="Confirma tu contraseña"  type="password" error={errors.password_confirmation} onChange={handleChange} value={values.password_confirmation}/>
                            <Button value="Registrarme" type="submit"/>
                        </form>
                       )}
                        </Formik>
                      
                       
                    </div>
                   
                    <div className="text-center mt-4">
        <p>
          <a href="/register" className="text-orange-600 hover:text-orange-500">Regístrate como postulante</a>
        </p>
        <p>¿Ya tienes una cuenta? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Inicia sesión</a></p>
      </div>
            </div>
        </div>
        <div className="relative lg:w-5/12 xl:w-1/2 flex items-center justify-center overflow-hidden">
            <img className="object-cover h-screen w-full" src="/images/registere.jpg" alt="Imagen"/>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-transparent"></div>
        </div>
    </div>
);
}

export default RegistroE