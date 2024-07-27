import React, { useEffect, useState, useRef } from 'react';
import axios from '../../services/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


interface Ubicacion {
    id: number;
    provincia: string;
    canton: string;
    created_at: string;
    updated_at: string;
}

interface Titulo {
    id: number;
    nivel_educacion: string;
    campo_amplio: string;
    titulo: string;
    created_at: string;
    updated_at: string;
}

interface Formacion {
    id_postulante: number;
    id_titulo: number;
    institucion: string;
    estado: string;
    fecha_ini: string;
    fecha_fin: string | null;
    titulo_acreditado: string;
    titulo: Titulo;
}

interface Idioma {
    id_postulante: number;
    id_idioma: number;
    nivel_oral: string;
    nivel_escrito: string;
    idioma: {
        id: number;
        nombre: string;
        created_at: string;
        updated_at: string;
    };
}

interface RedSocial {
    id_postulante_red: number;
    id_postulante: number;
    nombre_red: string;
    enlace: string;
    created_at: string;
    updated_at: string;
}

interface Certificado {
    id_certificado: number;
    id_postulante: number;
    titulo: string;
    certificado: string;
    created_at: string;
    updated_at: string;
}

interface FormacionProfesional {
    id_formacion_pro: number;
    id_postulante: number;
    empresa: string;
    puesto: string;
    fecha_ini: string;
    fecha_fin: string;
    descripcion_responsabilidades: string;
    persona_referencia: string;
    contacto: string;
    anios_e: number;
    area: string;
    created_at: string;
    updated_at: string;
}

interface PostulanteData {
    postulante: {
        id_postulante: number;
        id_ubicacion: number;
        id_usuario: number;
        nombres: string;
        apellidos: string;
        fecha_nac: string;
        edad: number;
        estado_civil: string;
        cedula: string;
        genero: string;
        informacion_extra: string;
        foto: string;
        cv: string;
        ubicacion: Ubicacion;
        formaciones: Formacion[];
        idiomas: Idioma[];
        red: RedSocial[];
        certificado: Certificado[];
        formapro: FormacionProfesional[];
    };
}

const VerCV: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [profileData, setProfileData] = useState<PostulanteData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const photoRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const [profileResponse, imageResponse] = await Promise.all([
                        axios.get(`/curri/${user.id}`),
                        axios.get(`/foto/${user.id}`, { responseType: 'blob' })
                    ]);

                    const imageURL = URL.createObjectURL(imageResponse.data);

                    setProfileData(profileResponse.data);
                    setImageSrc(imageURL);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los datos del perfil. Por favor, intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

 

    const generatePDF = async () => {
        if (!profileData || !profileData.postulante) {
            console.error('No hay datos de perfil disponibles para generar el PDF.');
            return;
        }

        const doc = new jsPDF();
        let yOffset = 10; // Offset para manejar el espacio vertical en el PDF

        const addSection = (title: string) => {
            doc.setFontSize(16);
            doc.setTextColor(40, 116, 240);
            doc.text(title, 10, yOffset);
            yOffset += 10;
            doc.setFontSize(12);
            doc.setTextColor(0);
        };
        
        if (imageLoaded && photoRef.current) {
            const canvas = await html2canvas(photoRef.current);
            const imgData = canvas.toDataURL('image/jpeg');
            const imgWidth = 70; // Ancho de la imagen en el PDF
            const imgHeight = 50; // Calcula la altura proporcionalmente

            const pdfWidth = doc.internal.pageSize.getWidth();
            
            const margin = 10;
            const x = pdfWidth - imgWidth - margin;
            const y = margin;

            // Agregar la imagen al PDF
            doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        }
        const addText = (text: string) => {
            doc.text(text, 10, yOffset);
            yOffset += 10;

            // Verificar si es necesario agregar una nueva página
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 10; // Reiniciar el offset en la nueva página
            }
        };

        // Datos del perfil
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(`${profileData.postulante.nombres} ${profileData.postulante.apellidos}`, 10, yOffset);
        yOffset += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        addText(`Fecha de Nacimiento: ${profileData.postulante.fecha_nac}`);
        addText(`Edad: ${profileData.postulante.edad}`);
        addText(`Estado Civil: ${profileData.postulante.estado_civil}`);
        addText(`Cédula: ${profileData.postulante.cedula}`);
        addText(`Género: ${profileData.postulante.genero}`);

        // Información extra
        addSection('Presentación');
        addText(profileData.postulante.informacion_extra || '');

        // Redes
        if (profileData.postulante.red) {
            addSection('Redes');
            profileData.postulante.red.forEach((red) => {
                addText(`${red.nombre_red}: ${red.enlace}`);
            });
        }

        // Formación académica
        if (profileData.postulante.formaciones) {
            addSection('Formación Académica');
            profileData.postulante.formaciones.forEach((formacion) => {
                addText(`Institución: ${formacion.institucion}`);
                addText(`Título: ${formacion.titulo.titulo}`);
                addText(`Fecha de Inicio: ${formacion.fecha_ini}`);
                addText(`Fecha de Fin: ${formacion.fecha_fin}`);
                yOffset += 5; // Espacio adicional entre formaciones
            });
        }

        // Cursos
        if (profileData.postulante.certificado) {
            addSection('Cursos');
            profileData.postulante.certificado.forEach((curso) => {
                addText(`Nombre del Curso: ${curso.titulo}`);
                addText(`Certificado: ${curso.certificado}`);
                yOffset += 5; // Espacio adicional entre cursos
            });
        }

        // Experiencia
        if (profileData.postulante.formapro) {
            addSection('Experiencia');
            profileData.postulante.formapro.forEach((exp) => {
                addText(`Empresa: ${exp.empresa}`);
                addText(`Puesto: ${exp.puesto}`);
                addText(`Fecha de Inicio: ${exp.fecha_ini}`);
                addText(`Fecha de Fin: ${exp.fecha_fin}`);
                yOffset += 5; // Espacio adicional entre experiencias
            });
        }

        // Idiomas
        if (profileData.postulante.idiomas) {
            addSection('Idiomas');
            profileData.postulante.idiomas.forEach((idioma) => {
                addText(`Idioma: ${idioma.idioma.nombre}`);
                addText(`Nivel Oral: ${idioma.nivel_oral}`);
                addText(`Nivel Escrito: ${idioma.nivel_escrito}`);
                yOffset += 5; // Espacio adicional entre idiomas
            });
        }



       // Guardar el documento PDF
       const pdfBlob = doc.output('blob');
       const pdfFileName = `${profileData.postulante.nombres}_${profileData.postulante.apellidos}_CV.pdf`;

       try {
           const storageRef = ref(storage, `cvs/${pdfFileName}`);
           await uploadBytes(storageRef, pdfBlob);
           const downloadURL = await getDownloadURL(storageRef);
            // Enviar el URL del CV generado a tu API Laravel
            const apiUrl = `postulantes/${profileData.postulante.id_usuario}/cv`;
            await axios.put(apiUrl, { cv: downloadURL });
           console.log('URL del CV generado:', downloadURL);
       } catch (error) {
           console.error('Error al subir el PDF a Firebase Storage:', error);
       }
    };

    if (loading) return <p>Cargando...</p>;

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Perfil</h1>
            <button onClick={generatePDF}>Generar PDF</button>
            
            {imageSrc && (
                <div>
                    <h2>Foto de Perfil:</h2>
                    <img
                        ref={photoRef}
                        src={imageSrc}
                        alt="Foto de perfil"
                        style={{
                            width: '400px',  // Ancho en la interfaz web
                            height: '300px', // Altura en la interfaz web
                                 // Opacidad cero para ocultar en la interfaz web
                            position: 'absolute', // Asegura que no ocupe espacio visible
                            zIndex: -1,           // Coloca detrás de otros elementos
                        }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            )}
        </div>
    );
};

export default VerCV;
