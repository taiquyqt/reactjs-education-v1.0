
export interface Location {
  id: number;
  description: string;
  roomName: string;
}
export interface CreateLocationRequest {
  description: string;
  roomName: string;
}

export interface UpdateLocationRequest {
  description?: string;
  roomName?: string;
}

