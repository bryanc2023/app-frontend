import React, { useEffect, useState } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import jsPDF from 'jspdf';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

import { format } from 'date-fns';

interface CurriTabProps {
  cvs: CV[];
  handleViewCV: (id: number) => void;
  handleDownloadCV: (url: string) => void;
}

interface CV {
  id: number;
  nombre: string;
  imagen: string;
  url: string;
}



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

interface Habilidad {
  id_postulante: number;
  id_habilidad: number;
  nivel: string;
  habilidad: {
    id: number;
    habilidad: string;
    created_at: string;
    updated_at: string;
  };
}

interface Competencia {
  id_postulante: number;
  id_competencia: number;
  nivel: string;
  competencia: {
    id: number;
    grupo: string;
    nombre: string;
    descripcion: string;
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
    telefono: string;
    formaciones: Formacion[];
    idiomas: Idioma[];
    red: RedSocial[];
    certificado: Certificado[];
    formapro: FormacionProfesional[];
    habilidades: Habilidad[];
    competencias: Competencia[];
  };
}

const CurriTab: React.FC<CurriTabProps> = ({  }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<PostulanteData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        if (user) {
          setLoading(true);
          const response = await axios.get(`/postulante/${user.id}/cv`);
          const data = response.data;
          setCvs([{ id: user.id, nombre: user.name, url: data.cv_url ,imagen: data.imagen}]);
          const [profileResponse, imageResponse] = await Promise.all([
            axios.get(`/curri/${user.id}`),
            axios.get(`/foto/${user.id}`, { responseType: 'blob' }),
          ]);

          const imageURL = URL.createObjectURL(imageResponse.data);

          setProfileData(profileResponse.data);
          setImageSrc(imageURL);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al obtener el CV:', error);
        setError('Error al obtener el CV');
        setLoading(false);
      }
    };

    fetchCVs();
  }, [user]);

  const getModifiedEstadoCivil = (estadoCivil: any, genero: any) => {
    if (genero.toLowerCase() === 'femenino') {
      if (estadoCivil.endsWith('o')) {
        return estadoCivil.slice(0, -1) + 'a';
      }
    }
    return estadoCivil;
  };

  const generatePDF = async () => {
    if (!profileData || !profileData.postulante) {
      console.error('No hay datos de perfil disponibles para generar el PDF.');
      return;
    }

    const doc = new jsPDF();
    let yOffset = 10;
    const bottomMargin = 10; // Margen inferior deseado




    const addSection = (title: string) => {
      const titleHeight = 10;
      const lineHeight = 1;
      const spaceNeeded = titleHeight + lineHeight + 10; // Espacio necesario para la sección

      // Verificar si hay suficiente espacio en la página actual
      if (yOffset + spaceNeeded > doc.internal.pageSize.height - bottomMargin) {
        doc.addPage(); // Agregar una nueva página si no hay suficiente espacio
        yOffset = 10; // Reiniciar el yOffset en la nueva página
      }

      yOffset += 2;

      // Dibujar rectángulo con fondo gris si se especifica backgroundColor


      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 165, 0);
      doc.text(title, 10, yOffset);
      doc.setDrawColor(255, 165, 0);
      doc.setLineWidth(lineHeight);
      doc.line(10, yOffset + titleHeight, doc.internal.pageSize.width - 10, yOffset + titleHeight);
      yOffset += titleHeight + lineHeight;
      yOffset += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0);
    };

    const addText = (text: string) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const textWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(text, textWidth);

      lines.forEach((line: string) => {
        const parts = line.split(':');
        if (parts.length === 2) {
          const normalFont = doc.getFont();
          const fontSize = 12;
          const fontStyle = 'bold';
          const part1Width = doc.getStringUnitWidth(parts[0]) * fontSize / doc.internal.scaleFactor;
          doc.setFont(normalFont.fontName, fontStyle);
          doc.text(parts[0], 10, yOffset);
          const part2X = 10 + part1Width + 2;
          doc.setFont(normalFont.fontName, normalFont.fontStyle);

          // Si es la línea de Fecha de Nacimiento, formatear la fecha
          if (parts[0].trim() === 'Fecha de Nacimiento') {
            const fechaNacimiento = format(new Date(profileData.postulante.fecha_nac), 'dd-MM-yyyy');
            doc.text(` : ${fechaNacimiento}`, part2X, yOffset);
          } else {
            doc.text(` : ${parts[1]}`, part2X, yOffset);
          }
        } else {
          doc.text(line, 10, yOffset);
        }

        yOffset += 10;

        // Verificar si es necesario agregar una nueva página
        if (yOffset > doc.internal.pageSize.height - bottomMargin - 20) {
          doc.addPage();
          yOffset = 10; // Reiniciar yOffset en la nueva página
        }
      });
    };


    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = async () => {
        const imgWidth = 70;
        const imgHeight = 50;
        const pdfWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const x = pdfWidth - imgWidth - margin;
        const y = margin;

        doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('HOJA DE VIDA', 10, yOffset);
        doc.setLineWidth(0.5); // Grosor de la línea de subrayado
        doc.line(10, 11, 55, 11); // Coordenadas para el subrayado

        yOffset += 10;
        const fullName = `${profileData.postulante.nombres.toUpperCase()} ${profileData.postulante.apellidos.toUpperCase()}`;
        doc.text(fullName, 10, yOffset);
        yOffset += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 165, 0);
        doc.text('INFORMACIÓN PERSONAL', 10, yOffset);
        yOffset += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0);
        addText(`Fecha de Nacimiento: ${profileData.postulante.fecha_nac}`);
        addText(`Edad: ${profileData.postulante.edad}`);
        addText(`Estado Civil: ${getModifiedEstadoCivil(profileData.postulante.estado_civil, profileData.postulante.genero)}`);
        addText(`Cédula: ${profileData.postulante.cedula}`);
        addText(`Género: ${profileData.postulante.genero}`);
        addText(`Teléfono de contacto :${profileData.postulante.telefono}`);

        addSection('UBICACIÓN');
        addText(`Provincia: ${profileData.postulante.ubicacion.provincia}`);
        addText(`Canton: ${profileData.postulante.ubicacion.canton}`);
        yOffset += 7;

        addSection('PRESENTACIÓN');
        addText(profileData.postulante.informacion_extra || '');

        if (profileData.postulante.formaciones.length > 0) {


          addSection('INSTRUCCIÓN FORMAL');
          const requiredSpace = 40; // Ajusta este valor según el espacio necesario para cada iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;

            // Redibujar el fondo naranja y el texto vertical en la nueva página
            const leftSectionText = 'INSTRUCCIÓN FORMAL';
            const leftSectionX = 4;
            let leftSectionYStart = yOffset;
            let leftSectionYEnd = yOffset + (profileData.postulante.formaciones.length * 30); // Ajusta según el espacio necesario

            // Dibujar el fondo naranja para el texto vertical
            const rectWidth = 10; // Ajusta este valor según sea necesario
            const textHeight = doc.getTextDimensions(leftSectionText).h;
            doc.setFillColor(255, 165, 0); // Naranja
            doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');

            // Dibujar el texto vertical en la parte izquierda con letras blancas
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255); // Blanco
            doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
              angle: -90,
              align: 'left',
            });

          }else{
               // Redibujar el fondo naranja y el texto vertical en la nueva página
               const leftSectionText = 'INSTRUCCIÓN FORMAL';
               const leftSectionX = 4;
               let leftSectionYStart = yOffset;
               let leftSectionYEnd = yOffset + (profileData.postulante.formaciones.length * 30); // Ajusta según el espacio necesario
 
               // Dibujar el fondo naranja para el texto vertical
               const rectWidth = 10; // Ajusta este valor según sea necesario
               const textHeight = doc.getTextDimensions(leftSectionText).h;
               doc.setFillColor(255, 165, 0); // Naranja
               doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
               // Dibujar el texto vertical en la parte izquierda con letras blancas
               doc.setFontSize(12);
               doc.setFont('helvetica', 'bold');
               doc.setTextColor(255, 255, 255); // Blanco
               doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
                 angle: -90,
                 align: 'left',
               });
          }


          profileData.postulante.formaciones.forEach((formacion) => {
            const requiredSpace = 40; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;

             
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(0);

            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            const startDate = format(new Date(formacion.fecha_ini), 'MMM-yyyy');
            const endDate = formacion.fecha_fin ? format(new Date(formacion.fecha_fin), 'MMM-yyyy') : 'Presente';

            doc.setFont('helvetica', 'bold');
            addText(`${formacion.titulo_acreditado}`);
            doc.setFont('helvetica', 'italic');
            addText(`${formacion.titulo.nivel_educacion} en ${formacion.titulo.campo_amplio}`);
            doc.setFont('helvetica', 'normal');
            addText(`Fechas: ${startDate} - ${endDate}`);
            addText(`Institución: ${formacion.institucion}`);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración
          });
        }


        if (profileData.postulante.formapro.length > 0) {
          addSection('EXPERIENCIA LABORAL');

       
          let requiredSpace = 40; // Espacio base para cada iteración sin funciones y responsabilidades
        

          // Comprobar si hay espacio suficiente para una nueva iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;
            const leftSectionText = 'EXPERIENCIA LABORAL';
            const leftSectionX = 4;
            let leftSectionYStart = yOffset;
            let leftSectionYEnd = yOffset + (profileData.postulante.formapro.length * 60); // Ajusta según el espacio necesario
  
            // Dibujar el fondo naranja para el texto vertical
            const rectWidth = 10; // Ajusta este valor según sea necesario
            const textHeight = doc.getTextDimensions(leftSectionText).h;
            doc.setFillColor(255, 165, 0); // Naranja
            doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
  
            // Dibujar el texto vertical en la parte izquierda con letras blancas
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255); // Blanco
            doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
              angle: -90,
              align: 'left',
            });
          }else{
            const leftSectionText = 'EXPERIENCIA LABORAL';
            const leftSectionX = 4;
            let leftSectionYStart = yOffset;
            let leftSectionYEnd = yOffset + (profileData.postulante.formapro.length * 60); // Ajusta según el espacio necesario
  
            // Dibujar el fondo naranja para el texto vertical
            const rectWidth = 10; // Ajusta este valor según sea necesario
            const textHeight = doc.getTextDimensions(leftSectionText).h;
            doc.setFillColor(255, 165, 0); // Naranja
            doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
  
            // Dibujar el texto vertical en la parte izquierda con letras blancas
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255); // Blanco
            doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
              angle: -90,
              align: 'left',
            });
          }

     

          profileData.postulante.formapro.forEach((exp) => {
            const lineHeight = 6; // Ajustar el espacio entre ítems de la lista
            let requiredSpace = 40; // Espacio base para cada iteración sin funciones y responsabilidades
            const funcionesResponsabilidades = exp.descripcion_responsabilidades.split(',');

            if (funcionesResponsabilidades.length > 1) {
              requiredSpace += funcionesResponsabilidades.length * lineHeight; // Añadir espacio para cada ítem de la lista
            } else {
              requiredSpace += lineHeight; // Añadir espacio para la descripción normal
            }

            // Comprobar si hay espacio suficiente para una nueva iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
             
            }

    
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(0);

            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;

            const startDate = format(new Date(exp.fecha_ini), 'MMM-yyyy');
            const endDate = exp.fecha_fin ? format(new Date(exp.fecha_fin), 'MMM-yyyy') : 'Presente';

            doc.setFont('helvetica', 'normal');
            addText(`Empresa/Institución: ${exp.empresa}`);
            doc.setFont('helvetica', 'normal');
            addText(`Cargo: ${exp.puesto}`);
            addText(`Fechas: ${startDate} - ${endDate}`);
            const areaText = exp.area.split(',')[1].trim();
            addText(`Área: ${areaText}`);

            if (funcionesResponsabilidades.length > 1) {
              // Si hay más de un elemento (separados por coma), crear una lista
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              doc.text('Funciones y responsabilidades en el cargo:', 10, yOffset);

              yOffset += 8;

              // Iterar sobre cada elemento y agregar a la lista
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              funcionesResponsabilidades.forEach((item, index) => {
                yOffset += lineHeight; // Ajustar el espacio entre ítems de la lista
                doc.text(`${index + 1}. ${item.trim()}`, 15, yOffset); // Numerar cada ítem de la lista
              });
              yOffset += 8;
            } else {
              // Si no hay comas, agregar el texto normalmente
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.text(`Funciones y responsabilidades en el cargo: ${exp.descripcion_responsabilidades}`, 10, yOffset);
              yOffset += 8;
            }

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración
          });
        }

        if (profileData.postulante.certificado.length > 0) {
          addSection('CURSOS Y CAPACITACIONES');
          const requiredSpace = 40; // Ajusta este valor según el espacio necesario para cada iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;
           
          const leftSectionText = 'CURSOS ';
          const leftSectionX = 4;
          const leftSectionYStart = yOffset;
          const leftSectionYEnd = yOffset + (profileData.postulante.certificado.length * 40); // Ajusta según el espacio necesario

          // Dibujar el fondo naranja para el texto vertical
          const rectWidth = 10; // Ajusta este valor según sea necesario
          const textHeight = doc.getTextDimensions(leftSectionText).h;
          doc.setFillColor(255, 165, 0); // Naranja
          doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');

          // Dibujar el texto vertical en la parte izquierda con letras blancas
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255); // Blanco
          doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
            angle: -90,
            align: 'left',
          });
          }else{
        
          const leftSectionText = 'CURSOS ';
          const leftSectionX = 4;
          const leftSectionYStart = yOffset;
          const leftSectionYEnd = yOffset + (profileData.postulante.certificado.length * 40); // Ajusta según el espacio necesario

          // Dibujar el fondo naranja para el texto vertical
          const rectWidth = 10; // Ajusta este valor según sea necesario
          const textHeight = doc.getTextDimensions(leftSectionText).h;
          doc.setFillColor(255, 165, 0); // Naranja
          doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');

          // Dibujar el texto vertical en la parte izquierda con letras blancas
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255); // Blanco
          doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
            angle: -90,
            align: 'left',
          });
          }
          
          profileData.postulante.certificado.forEach((curso) => {
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(0);
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;
            addText(`Título: ${curso.titulo}`);
            addText(`Enlace del certificado: ${curso.certificado}`);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración
          });
          yOffset += 7;
        }

        if (profileData.postulante.idiomas.length > 0) {
          addSection('IDIOMAS');
          const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'IDIOMAS';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.idiomas.length * 30); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }else{
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'IDIOMAS';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.idiomas.length * 30); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }
               
          profileData.postulante.idiomas.forEach((idioma) => {
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }

      



            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(0);

            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;
            doc.setFont('helvetica', 'bold');
            addText(` ${idioma.idioma.nombre}`);
            doc.setFont('helvetica', 'normal');
            addText(`Nivel Oral: ${idioma.nivel_oral}`);
            addText(`Nivel Escrito: ${idioma.nivel_escrito}`);
            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración
          });
        }

        if (profileData.postulante.habilidades.length > 0) {
          addSection('HABILIDADES');
          const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'HABILIDADES';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.habilidades.length * 30); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }else{
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'HABILIDADES';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.habilidades.length * 30); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }
               
          profileData.postulante.habilidades.forEach((habilidad) => {
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }


  
  
  
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0);
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;

            doc.setFont('helvetica', 'normal');
            addText(`Habilidad: ${habilidad.habilidad.habilidad}`);
            addText(`Nivel de destreza: ${habilidad.nivel}`);


            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración

          });
        }


        if (profileData.postulante.competencias.length > 0) {
          addSection('COMPETENCIAS');
          const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
          if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yOffset = 10;
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'COMPETENCIAS';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.competencias.length * 40); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }else{
             // Redibujar el fondo naranja y el texto vertical en la nueva página
             const leftSectionText = 'COMPETENCIAS';
             const leftSectionX = 4;
             let leftSectionYStart = yOffset;
             let leftSectionYEnd = yOffset + (profileData.postulante.competencias.length * 40); // Ajusta según el espacio necesario
 
             // Dibujar el fondo naranja para el texto vertical
             const rectWidth = 10; // Ajusta este valor según sea necesario
             const textHeight = doc.getTextDimensions(leftSectionText).h;
             doc.setFillColor(255, 165, 0); // Naranja
             doc.rect(leftSectionX - 5, leftSectionYStart, rectWidth, leftSectionYEnd - leftSectionYStart, 'F');
 
             // Dibujar el texto vertical en la parte izquierda con letras blancas
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             doc.setTextColor(255, 255, 255); // Blanco
             doc.text(leftSectionText, leftSectionX, leftSectionYStart + textHeight, {
               angle: -90,
               align: 'left',
             });
          }
          profileData.postulante.competencias.forEach((competencia) => {
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }

  
  
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0);
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;

            doc.setFont('helvetica', 'normal');
            addText(`Competencia: ${competencia.competencia.nombre}`);
            addText(`Grupo al que pertenece: ${competencia.competencia.grupo}`);
            addText(`Nivel de desarrollo: ${competencia.nivel}`);


            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración

          });
          yOffset += 7;
        }
        if (profileData.postulante.red.length > 0) {
          addSection('REDES SOCIALES');
          profileData.postulante.red.forEach((red) => {
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }
            
  
  
  
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0);

            addText(`${red.nombre_red} : ${red.enlace}`);
          });
        }

        if (profileData.postulante.formapro.length > 0) {
          addSection('REFERENCIAS PERSONALES');

          profileData.postulante.formapro.forEach((exp) => {
            // Comprobar si hay espacio suficiente para una nueva iteración
            const requiredSpace = 30; // Ajusta este valor según el espacio necesario para cada iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;
            }
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0);

            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230); // Color gris claro
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;

            doc.setFont('helvetica', 'bold');
            addText(`${exp.persona_referencia}`);
            doc.setFont('helvetica', 'normal');
            addText(`Perteneciente a: ${exp.empresa}`);
            addText(`Contacto: ${exp.contacto}`);
            yOffset += 5;

            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10; // Ajustar el yOffset para la siguiente iteración
          });
        }





        const pdfBlob = doc.output('blob');
        const pdfFileName = `${profileData.postulante.nombres}_${profileData.postulante.apellidos}_CV.pdf`;

        try {
          const storageRef = ref(storage, `cvs/${pdfFileName}`);
          await uploadBytes(storageRef, pdfBlob);
          const downloadURL = await getDownloadURL(storageRef);
          setPreviewUrl(downloadURL);

          const apiUrl = `/postulantes/${profileData.postulante.id_usuario}/cv`;
          await axios.put(apiUrl, { cv: downloadURL });

          console.log('URL del CV generado:', downloadURL);

          Swal.fire({
            icon: 'success',
            title: '!Hoja de vida lista!',
            text: 'Se ha actualizado/generado tu hoja de vida correctamente',
          });
          handleViewCV(downloadURL);
        } catch (error) {
          console.error('Error al subir el PDF a Firebase Storage:', error);
        }
      };
    }
  };

  const handleViewCV = (url: string) => {
    setPreviewUrl(url);
  };

  const handleDownloadCV = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200">
      <div className="flex justify-between items-center flex-wrap">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2 w-full sm:w-auto">Currículo</h2>
        {loading ? (
          <></>
        ) : (
          <button
            onClick={generatePDF}
            className="mb-4 sm:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {profileData?.postulante.cv != null ? '¿Has añadido/modificado información?: Actualiza tu CV' : 'Generar CV'}
          </button>
        )}
      </div>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : cvs.length > 0 && profileData?.postulante.cv != null ? (
        cvs.map((cv, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700 relative flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/3 h-64 sm:h-auto border border-gray-600">
              <iframe src={cv.url} width="100%" height="100%" title={`Vista previa del CV de ${cv.nombre}`}></iframe>
            </div>
            <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex flex-col justify-between w-full">
              <p className="mb-2"><strong>Nombre:</strong> {cv.nombre}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleViewCV(cv.url)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <FaEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadCV(cv.url)}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <FaDownload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Aun no has generado tu hoja de vida.</p>
      )}

      {previewUrl && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Vista previa del CV</h3>
          <iframe
            src={previewUrl}
            width="100%"
            height="750px"
            style={{ border: '1px solid rgba(0, 0, 0, 0.3)' }}
            title="Vista previa del CV"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default CurriTab;
