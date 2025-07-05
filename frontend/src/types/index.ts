export interface User {
  id: string;
  username: string;
  email: string;
  flatNumber?: string;
  phoneNumber?: string;
  preferredContact?: string;
  contactTimes?: string[];
  interests?: string[];
  isAdmin?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  language?: string;
  ageRange?: string;
  category?: string[];
  description?: string;
  coverUrl?: string;
  owner: User;
  isAvailable: boolean;
  addedDate: string;
}

export interface BoardGame {
  id: string;
  title: string;
  type: string;
  minPlayers?: number;
  maxPlayers?: number;
  minAge?: number;
  playTime?: string;
  category?: string[];
  description?: string;
  imageUrl?: string;
  owner: User;
  isAvailable: boolean;
  addedDate: string;
}

export interface Request {
  id: string;
  item: Book | BoardGame;
  requesterId: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  requestDate: string;
  responseDate?: string;
  pickupDate?: string;
  returnDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  location?: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: string;
}