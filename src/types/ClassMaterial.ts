export interface ClassMaterial {
    id: number;
    title: string;
    className: string;
    filePath: string;
    fileType: string;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
    classId: number;
    downloadCount?: number;
}
