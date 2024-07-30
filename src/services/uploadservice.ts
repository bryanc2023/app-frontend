import { Api } from "./api";

class UploadService {
    static async uploadFile(file: File): Promise<any> {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await Api.post('/upload', formData);
        return response;
      } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
      }
    }
  }
  

  export default UploadService;