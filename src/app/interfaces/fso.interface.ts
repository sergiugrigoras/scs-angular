export interface FsoModel {
    date?: Date,
    fileName?: string | null,
    fileSize?: number | null,
    id?: number,
    isFolder: boolean,
    name: string,
    parentId: number | null,
    isSelected?: boolean,
    content?: FsoModel[]
}