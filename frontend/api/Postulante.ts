import instance from "../src/services/axios"


export default {
    getDataPostulante (idPostulante : number) {
        return instance.get(`postulante/${idPostulante}`)
    }
}