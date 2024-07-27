export type DataNotifyApi = {
    id: string
    type: string
    notifiable_type: string
    notifiable_id: number
        data: {
            mensaje: string
            asunto: string 
            destinatario: string
        },
        read_at: Date
        created_at: Date
        updated_at: Date
}

export type dataNotificable = {
    id: string
    mensaje: string
    asunto: string 
    destinatario: string
}

