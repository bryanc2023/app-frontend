export class Api {
    static baseUrl = "http://localhost:8000/api";
  
    static async get<T>(url: string): Promise<any> {
        const response = await fetch(`${Api.baseUrl}${url}`);
      
        const dataResponse = await response.json();
        return {
            statusCode: response.status,
            data: dataResponse,
        };
    }
    
    static async post<T>(url: string, data?: any): Promise<any> {
      const response = await fetch(`${Api.baseUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : null,
      });
  
      const dataResponse = await response.json();
      return {
        statusCode: response.status,
        data: dataResponse,
      };
    }
}