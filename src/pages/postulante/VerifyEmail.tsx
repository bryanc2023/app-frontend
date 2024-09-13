import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Api } from '../../services/api'; // Asegúrate de que Api esté configurado correctamente

const VerifyEmail = () => {
    const { id, token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [bgColor, setBgColor] = useState('#FFA500');

    useEffect(() => {
    
        
        const verifyEmail = async () => {
            try {
             
                const response = await Api.get(`/auth/verifyEmail/${id}/${token}`);
          

                if (response.statusCode === 200) {
                    setMessage('¡Correo verificado! Tu correo ha sido verificado exitosamente. Ya puedes logearte correctamente.');
                    setBgColor('#30b33b'); // Verde para éxito
                } else if (response.statusCode === 401) {
                    setMessage('Error de verificación. Este enlace ya ha sido verificado.');
                    setBgColor('#FF0000'); // Rojo para error
                } else if (response.statusCode === 400) {
                    setMessage('Error de verificación. Este enlace es inválido.');
                    setBgColor('#FF0000'); // Rojo para error
                } else {
                    setMessage('Error de verificación. No se pudo verificar tu correo. Inténtalo de nuevo.');
                    setBgColor('#FF0000'); // Rojo para error
                }
            } catch (error) {
                console.error('Error al verificar el correo:', error);
                setMessage('Error de verificación. Ocurrió un error al verificar tu correo. Inténtalo de nuevo.');
                setBgColor('#FF0000'); // Rojo para error
            }
        };

        verifyEmail();
    }, [id, token, navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <>
            <header className="bg-gray-800 p-4 flex justify-between items-center fixed w-full z-10">
                <h1 className="text-white text-2xl font-bold">
                    Postula
                </h1>
            </header>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url(/public/images/verifi.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(50%)' }}></div>
                <div style={{ position: 'relative', textAlign: 'center', backgroundColor: bgColor, padding: '40px', borderRadius: '15px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '80%' }}>
                    <h1 style={{ color: '#ffffff', marginBottom: '20px', fontWeight: 'bold', fontSize: '24px' }}>
                        <FontAwesomeIcon icon={faEnvelope} size="lg" style={{ marginRight: '10px' }} />
                        VERIFICACIÓN DE CORREO
                    </h1>
                    <p style={{ color: '#ffffff', fontSize: '18px', lineHeight: '1.5' }}>{message}</p>
                    <button onClick={handleBackToHome} style={{ marginTop: '30px', padding: '15px 30px', fontSize: '16px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#ffffff', color: '#000000', border: 'none', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}>
                        Regresar a la página principal
                    </button>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;
