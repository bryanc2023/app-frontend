import React, { useEffect, useState } from 'react';
import { FaEye, FaDownload, FaSpinner } from 'react-icons/fa';
import axios from '../../services/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import jsPDF from 'jspdf';
import { storage } from '../../config/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import Modal from 'react-modal';
import FileSaver from 'file-saver';


interface Postulante {
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
  cv: string | null;
  vigencia: number;
  telefono: string;
  ubicacion: {
    id: number;
    provincia: string;
    canton: string;
    created_at: string;
    updated_at: string;
  };
  formaciones: {
    id_postulante: number;
    id_titulo: number;
    institucion: string;
    estado: string;
    fecha_ini: string;
    fecha_fin: string | null;
    titulo_acreditado: string;
    titulo: {
      id: number;
      nivel_educacion: string;
      campo_amplio: string;
      titulo: string;
      created_at: string;
      updated_at: string;
    };
  }[];
  idiomas: {
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
  }[];
  red: any[];
  certificado: any[];
  formapro: any[];
  habilidades: any[];
  competencias: any[];
}

interface ProfileData {
  postulante: Postulante;
}

const CurriTab: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [cvs, setCvs] = useState<typeof cvs[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [showAgreement, setShowAgreement] = useState<boolean>(false);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [termsText, setTermsText] = useState<string>('');
  const [openP, setOpenP] = useState<boolean>(false);

  useEffect(() => {
   

    const fetchTerms = async () => {
      try {
        const response = await axios.get('/configuraciones'); // Asegúrate de que este endpoint devuelve los términos y condiciones
        const activeConfig = response.data.find((config: any) => config.vigencia);
        if (activeConfig) {
          setTermsText(activeConfig.terminos_condiciones);
        } else {
          setTermsText('No terms available');
        }
      } catch (error) {
        console.error('Error fetching terms and conditions:', error);
        setTermsText('Error loading terms and conditions');
      }
    };

    fetchCVs();
    fetchTerms();
  }, [user]);
  const fetchCVs = async () => {
    try {
      if (user) {
        setLoading(true);
        const response = await axios.get(`/postulante/${user.id}/cv`);
        const data = response.data;
        setCvs([{ id: user.id, nombre: user.name, url: data.cv_url, image: data.image_url }]);

        const profileResponse = await axios.get(`/curri/${user.id}`);
        setProfileData(profileResponse.data);
        // Guardar la URL de la imagen en el estado imageSrc
        const imageUrl = `${profileResponse.data.postulante.foto}`;
        setImageSrc(imageUrl);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al obtener el CV:', error);
      setError('Error al obtener el CV');
      setLoading(false);
    }
  };
  const getModifiedEstadoCivil = (estadoCivil: string, genero: string) => {
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

    setGenerating(true);
    setPreviewUrl(null);

    const doc = new jsPDF();
    let yOffset = 10;
    const bottomMargin = 10;

    const checkPageBreak = (requiredSpace) => {
      if (yOffset + requiredSpace > doc.internal.pageSize.height - bottomMargin) {
        doc.addPage();
        yOffset = 10;
      }
    };

    const formatPresentacion = (text) => {
      // Eliminar espacios en blanco adicionales
      const cleanText = text.replace(/\s+/g, ' ').trim();

      // Dividir el texto en bloques sin cortar palabras
      const chunks = [];
      let startIndex = 0;

      while (startIndex < cleanText.length) {
        // Tomar un bloque de hasta 945 caracteres
        let endIndex = startIndex + 960;

        // Si el bloque excede la longitud del texto, ajustarlo
        if (endIndex >= cleanText.length) {
          endIndex = cleanText.length;
        } else {
          // Asegurarse de que no cortamos una palabra
          // Retrocedemos hasta el último espacio antes de endIndex
          const lastSpaceIndex = cleanText.lastIndexOf(' ', endIndex);
          endIndex = lastSpaceIndex !== -1 ? lastSpaceIndex : endIndex;
        }

        // Agregar el bloque al array de chunks
        chunks.push(cleanText.substring(startIndex, endIndex).trim());

        // Actualizar el índice de inicio para el próximo bloque
        startIndex = endIndex + 1; // Avanzar más allá del espacio
      }

      return chunks;
    };



    const formatFunciones = (text) => {
      // Separar las funciones por puntos, eliminando espacios innecesarios y normalizando el texto
      const funciones = text
        .split('.')
        .map(f => f.replace(/\s+/g, ' ').trim()) // Reemplazar múltiples espacios por uno solo y eliminar espacios al inicio y fin
        .filter(f => f.length > 0); // Eliminar funciones vacías

      return funciones;
    };

    // Función para agregar funciones con ajuste de línea
    const addFormattedFunctions = (doc, funciones, yOffset, maxWidth) => {
      const lineHeight = 6; // Ajustar la altura de línea
      const bullet = '\u2022'; // Código de viñeta (•)

      funciones.forEach((funcion, index) => {
        const splitFunction = doc.splitTextToSize(`${bullet} ${funcion}`, maxWidth); // Ajustar el texto al tamaño de la página
        splitFunction.forEach((line) => {
          doc.text(line, 15, yOffset); // Texto con viñeta
          yOffset += lineHeight; // Ajuste del espacio entre líneas
        });
      });

      return yOffset;
    };

    const addSection = (title, sectionHeight) => {
      checkPageBreak(sectionHeight);

      yOffset += 2;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 165, 0);
      doc.text(title, 10, yOffset);
      doc.setDrawColor(255, 165, 0);
      doc.setLineWidth(1);
      doc.line(10, yOffset + 10, doc.internal.pageSize.width - 10, yOffset + 10);
      yOffset += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0);
    };

    const addText = (text) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const textWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(text, textWidth);
      const requiredSpace = lines.length * 10;

      checkPageBreak(requiredSpace + 10); // Asegura espacio antes de agregar texto

      lines.forEach((line) => {
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

        if (yOffset > doc.internal.pageSize.height - bottomMargin - 20) {
          doc.addPage();
          yOffset = 10;
        }
      });
    };
    if (imageSrc) {
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `${import.meta.env.VITE_API_URL2}/images/${profileData.postulante.foto.split('/').pop()}`; // Obtener solo el nombre del archivo
      img.onload = async () => {
        const imgWidth = 50;
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
        doc.setLineWidth(0.5);
        doc.line(10, 11, 55, 11);

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

        addSection('UBICACIÓN', 30);
        addText(`Provincia: ${profileData.postulante.ubicacion.provincia}`);
        addText(`Canton: ${profileData.postulante.ubicacion.canton}`);
        yOffset += 7;

        addSection('PRESENTACIÓN', 50);
        const presentacionChunks = formatPresentacion(profileData.postulante.informacion_extra || '');

        // Agregar cada bloque de texto al PDF
        presentacionChunks.forEach(chunk => {
          addText(chunk);  // Usar addText para agregar el texto al documento
        });

        if (profileData.postulante.formaciones.length > 0) {
          addSection('INSTRUCCIÓN FORMAL', 60);
          profileData.postulante.formaciones.forEach((formacion) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
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
            yOffset += 10;
          });
        }

        const formatearFecha = (fecha: string | null) => {
          if (!fecha) {
            return 'Presente'; // Si la fecha es null, devuelve "Presente"
          }

          // Crear una nueva instancia de la fecha correctamente
          const fechaObj = new Date(fecha + 'T00:00:00'); // Añadir la hora para evitar problemas de zona horaria

          // Formatear la fecha con mes y año
          const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
          let fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);

          // Capitalizar la primera letra del mes
          fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

          return fechaFormateada;
        };

        if (profileData.postulante.formapro.length > 0) {
          addSection('EXPERIENCIA LABORAL', 50);
          profileData.postulante.formapro.forEach((formacion) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 5;

            const startDate = formatearFecha(formacion.fecha_ini);
            const endDate = formacion.fecha_fin ? formatearFecha(formacion.fecha_fin) : 'Presente';

            doc.setFont('helvetica', 'normal');
            addText(`Empresa/Institución: ${formacion.empresa}`);
            doc.setFont('helvetica', 'normal');
            addText(`Cargo: ${formacion.puesto}`);
            addText(`Fechas: ${startDate} - ${endDate}`);
            const areaText = formacion.area.split(',')[1].trim();
            addText(`Área: ${areaText}`);

            const lineHeight = 6; // Ajustar el espacio entre ítems de la lista
            let requiredSpace = 40; // Espacio base para cada iteración sin funciones y responsabilidades
            const funcionesResponsabilidades = formacion.descripcion_responsabilidades
              ? formacion.descripcion_responsabilidades.split('.')
              : [];

            if (funcionesResponsabilidades.length > 1) {
              requiredSpace += funcionesResponsabilidades.length * lineHeight; // Añadir espacio para cada ítem de la lista
            } else {
              requiredSpace += lineHeight; // Añadir espacio para la descripción normal
            }

            const lineHeight2 = 6; // Altura de línea para ajustar el espacio entre líneas
            const pageHeight = doc.internal.pageSize.height - 10; // Altura de la página, con márgenes

            const checkPageOverflow = () => {
              if (yOffset > pageHeight) {
                doc.addPage(); // Añadir nueva página
                yOffset = 20; // Reiniciar el yOffset para la nueva página
              }
            };

            if (funcionesResponsabilidades.length > 1) {
              // Si hay más de un elemento (separados por puntos), crear una lista con viñetas
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              doc.text('Funciones y responsabilidades en el cargo:', 10, yOffset);
              yOffset += 8;

              checkPageOverflow(); // Verificar si es necesario hacer un salto de página

              // Iterar sobre cada función y agregarla a la lista con viñetas
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);

              funcionesResponsabilidades.forEach((item) => {
                // Dividir el texto de las funciones en base a los puntos
                const funcionesFormateadas = formatFunciones(item);

                funcionesFormateadas.forEach((funcion) => {
                  // Dividir el texto en líneas si es muy largo para ajustarlo al PDF
                  const splitText = doc.splitTextToSize(`• ${funcion}`, doc.internal.pageSize.width - 20);

                  splitText.forEach((line) => {
                    doc.text(line, 15, yOffset); // Añadir el texto de cada línea
                    yOffset += lineHeight2; // Ajustar el espacio entre líneas
                    checkPageOverflow(); // Verificar si es necesario hacer un salto de página
                  });
                });
              });

              yOffset += 8;
              checkPageOverflow(); // Verificar si es necesario hacer un salto de página
            } else {
              // Si solo es una descripción larga, ajustarla al espacio del PDF
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              doc.text('Funciones y responsabilidades en el cargo:', 10, yOffset);

              yOffset += 8;
              checkPageOverflow(); // Verificar si es necesario hacer un salto de página

              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);

              const descripcion = formacion.descripcion_responsabilidades || '';
              const descripcionFormateada = doc.splitTextToSize(descripcion, doc.internal.pageSize.width - 20); // Ajustar al ancho del PDF

              descripcionFormateada.forEach((line) => {
                doc.text(line, 10, yOffset); // Añadir cada línea ajustada al espacio
                yOffset += lineHeight2; // Ajustar el espacio entre líneas
                checkPageOverflow(); // Verificar si es necesario hacer un salto de página
              });

              yOffset += 8;
              checkPageOverflow(); // Verificar si es necesario hacer un salto de página
            }




            // Comprobar si hay espacio suficiente para una nueva iteración
            if (yOffset + requiredSpace > doc.internal.pageSize.height - 10) {
              doc.addPage();
              yOffset = 10;

            }

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }
        const addTextL = (text, link) => {
          if (link) {
            // Establecer el color azul para el enlace
            doc.setTextColor(0, 0, 255); // Azul
            doc.setFont('helvetica', 'normal'); // Cambiar a fuente normal para el enlace

            // Dibujar el texto del enlace
            const textWidth = doc.getTextWidth(text);
            const textHeight = 10; // Ajustar según el tamaño de la fuente
            doc.text(text, 10, yOffset);

            // Agregar el enlace
            doc.link(10, yOffset - textHeight, textWidth, textHeight, { url: link });

            // Restablecer el color a negro
            doc.setTextColor(0); // Negro
          } else {
            // Agrega solo texto normal si no hay enlace
            doc.setFont('helvetica', 'normal');
            doc.text(text, 10, yOffset);
          }
        };

        // Resto del código para generar el PDF
        if (profileData.postulante.certificado.length > 0) {
          addSection('CAPACITACIONES REALIZADAS', 30);
          profileData.postulante.certificado.forEach((curso) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            doc.setFont('helvetica', 'bold');
            addText(`${curso.titulo}`);
            doc.setFont('helvetica', 'normal');

            // Aquí se establece el enlace
            const linkText = curso.certificado ? 'Ver certificado' : 'No adjuntada';
            const linkUrl = curso.certificado || null;

            // Agrega el texto con enlace
            addTextL(linkText, linkUrl);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }

        if (profileData.postulante.idiomas.length > 0) {
          addSection('IDIOMAS', 30);
          profileData.postulante.idiomas.forEach((idioma) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            doc.setFont('helvetica', 'bold');
            addText(`${idioma.idioma.nombre}`);
            doc.setFont('helvetica', 'normal');
            addText(`Nivel Oral: ${idioma.nivel_oral}`);
            addText(`Nivel Escrito: ${idioma.nivel_escrito}`);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }

        if (profileData.postulante.habilidades.length > 0) {
          addSection('HABILIDADES', 30);
          profileData.postulante.habilidades.forEach((habilidad) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            doc.setFont('helvetica', 'bold');
            addText(`Habilidad: ${habilidad.habilidad.habilidad}`);
            doc.setFont('helvetica', 'normal');
            addText(`Nivel de destreza: ${habilidad.nivel}`);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }

        if (profileData.postulante.competencias.length > 0) {
          addSection('COMPETENCIAS', 30);
          profileData.postulante.competencias.forEach((competencia) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            doc.setFont('helvetica', 'bold');
            addText(`Competencia: ${competencia.competencia.nombre}`);
            doc.setFont('helvetica', 'normal');
            addText(`Grupo al que pertenece: ${competencia.competencia.grupo}`);
            doc.setFont('helvetica', 'normal');
            addText(`Nivel de desarrollo: ${competencia.nivel}`);


            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }

        if (profileData.postulante.red.length > 0) {
          addSection('REDES SOCIALES', 30);
          profileData.postulante.red.forEach((red) => {
            const lineYStart = yOffset;
            doc.setDrawColor(230, 230, 230);
            doc.line(10, lineYStart, doc.internal.pageSize.width - 10, lineYStart);
            yOffset += 8;

            doc.setFont('helvetica', 'bold');
            addText(`${red.nombre_red}`);
            doc.setFont('helvetica', 'normal');
            addText(`Enlace: ${red.enlace}`);

            yOffset += 2;
            const lineYEnd = yOffset;
            doc.line(10, lineYEnd, doc.internal.pageSize.width - 10, lineYEnd);
            yOffset += 10;
          });
        }
        if (profileData.postulante.formapro.length > 0) {
          addSection('REFERENCIAS PERSONALES', 30);
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

            // Obtener el valor de persona_referencia
            const personaReferencia = exp.persona_referencia || '';

            if (personaReferencia.includes('/')) {
              // Separar cargo y nombre si existe "/"
              const [cargo, nombre] = personaReferencia.split('/').map(item => item.trim());
              addText(nombre); // Información después de la barra
              if (cargo) {
                addText(`Cargo: ${cargo}`); // Información antes de la barra
              } else {
                addText(`Cargo: Persona Referencia`); // Si no hay cargo, mostrar este mensaje
              }
            } else {
              // Si no hay "/", mostrar persona_referencia como está
              addText(personaReferencia); // Mostrar directamente la información
              addText(`Cargo: No definido`); // Indicar que no se tiene información de cargo
            }

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
        const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
        
        try {
          const urlHost = `${import.meta.env.VITE_API_URL3}/storage/`;
          const formData = new FormData();
          formData.append('cv', pdfFile); // Agregar el blob y el nombre del archivo al FormData
          formData.append('url', urlHost);
          // Verifica el contenido del FormData
          for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
          }

          const apiUrl = `/postulantes/${profileData.postulante.id_usuario}/cv`;
          await axios.post(apiUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // Especificar el tipo de contenido
            },
          });
          // Establecer la URL predeterminada para la vista previa
          const userCVUrl = `${urlHost}cv/${pdfFileName}`; // URL para mostrar el CV
          console.log(userCVUrl)
          setPreviewUrl(userCVUrl);

          Swal.fire({
            icon: 'success',
            title: '!Hoja de vida lista!',
            text: 'Se ha actualizado/generado tu hoja de vida correctamente',
          });
          handleViewCV(userCVUrl);
          fetchCVs();
        } catch (error) {
          console.error('Error al subir el PDF a Firebase Storage:', error);
        } finally {
          setGenerating(false);
        }
      };

      img.onerror = (error) => {
        console.error('Error al cargar la imagen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la imagen del perfil.',
        });
        setGenerating(false);
      };
    } else {
      console.error('No se pudo cargar la imagen.');
      setGenerating(false);
    }
  };

  const handleViewCV = async (url) => {
    if (openP && previewUrl === url) {
      // Si ya está abierto el CV actual, cerrarlo
      setOpenP(false);
      setPreviewUrl('');
    } else {
      // Si no, abrir la vista previa
      setOpenP(true);
      setPreviewUrl(url);
    }
  };

  const handleDownloadCV = async (url:string) => {
    // Abrir el CV en una nueva pestaña
    const newWindow = window.open(url, '_blank');
    if (newWindow) newWindow.opener = null; // 
};

  const handleAgreementAccept = () => {
    setAgreementAccepted(!agreementAccepted);
  };

  const handleAgreementSubmit = () => {
    setShowAgreement(false);
    generatePDF();
  
  };

  const handleGenerateClick = () => {
    if (!profileData?.postulante.cv) {
      setShowAgreement(true);
    } else {
      generatePDF();
    }
  };
  const handleShowTerms = () => {
    setShowTerms(true);
  };

  const handleCloseTerms = () => {
    setShowTerms(false);
  };

  const handleLoad = () => {
    setLoading(false); // El iframe se ha cargado
};

const handleError = () => {
    setLoading(false); // Se produjo un error al cargar el iframe
    // Actualiza el estado de error
};
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-inner text-gray-200 relative">
      <div className="flex justify-between items-center flex-wrap">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-blue-500 pb-2 w-full sm:w-auto">Currículo</h2>
        {loading ? (
          <></>
        ) : (
          <>
            {profileData?.postulante.cv != null && (
              <label htmlFor="botoncv" className="ml-2 text-white">¿Has añadido/modificado información?</label>
            )}
            <button
              id="botoncv"
              onClick={handleGenerateClick}
              className="mb-4 sm:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {profileData?.postulante.cv != null ? 'Actualizar CV' : 'Generar CV'}
            </button>

          </>
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
            <iframe
                src={`${cv.url}`}
                width="100%"
                height="100%"
                title={`Vista previa del CV de ${cv.nombre}`}
                onLoad={handleLoad}  // Se llama cuando el iframe se carga correctamente
                onError={handleError} // Se llama si hay un error al cargar el iframe
                style={{ display: loading ? 'none' : 'block' }} // Oculta el iframe mientras se carga
            /></div>
            <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex flex-col justify-between w-full">
              <p className="mb-2"><strong>Nombre:</strong> {cv.nombre}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleViewCV(`${cv.url}`)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <FaEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const nombreArchivo = `${cv.nombre}_CV.pdf`; // O el formato que desees
                    handleDownloadCV(`${cv.url}`);
                  }}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                  rel="noopener noreferrer"
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

      {generating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
          <FaSpinner className="text-white text-4xl animate-spin mb-4" />
          <p className="text-white text-lg font-semibold">Espere por favor... Se está generando su hoja de vida, un momento mientras se realiza la operación.</p>
        </div>
      )}

      {openP && previewUrl && !generating && (
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

      <Modal
        isOpen={showAgreement}
        onRequestClose={() => setShowAgreement(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Acuerdo de Compromiso</h2>
          <p className="mb-4">
            Al generar su CV, usted acepta que la página Postula pueda usar sus datos personales para los fines descritos en los
            <span
              onClick={handleShowTerms}
              className="text-blue-500 cursor-pointer"
            >
              {' '}términos y condiciones
            </span>.
          </p>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={agreementAccepted}
              onChange={handleAgreementAccept}
            />
            Acepto los términos y condiciones
          </label>
          <div className="flex justify-end">
            <button
              onClick={handleAgreementSubmit}
              disabled={!agreementAccepted}
              className={`px-4 py-2 rounded-md transition duration-300 ${agreementAccepted ? 'bg-blue-500 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
              Continuar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTerms}
        onRequestClose={handleCloseTerms}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg text-black max-w-md mx-auto max-h-full">
          <h2 className="text-xl font-semibold mb-4">Términos y Condiciones</h2>
          <div className="overflow-y-auto max-h-96">
            <div className="space-y-4 text-sm">
              <pre className="whitespace-pre-wrap">{termsText}</pre>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCloseTerms}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CurriTab;