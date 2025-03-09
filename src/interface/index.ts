export interface StoreLikes {
  id:string;
  userId:string;
  storeId:string;
  createDt: string;
}
export interface StoreEventRequests {
  id:string;
  userId:string;
  eventId:string;
  storeId:string;
  createDt: string;
  menuId:string;
  roomId:string;
}
export interface EventReserves {
  id:string;
  userId:string;
  eventId:string;
  storeId:string;
  createDt: string;
}

export interface StoreEvent {
  id: string;
  storeId: string;
  userId: string;
  menuId: string;
  menuCount: number;
  isOpen: boolean;
  discountPercent: number;
  storeEventRequestId: string;
  closeDt: string;
  createDt: string;
  eatDt: string;
  store: Store;
  menu: Menu;
}

export interface Store {
  id: string;
  name: string;
  userId: string;
  isApproval: boolean;
  businessNo: string;
  imageUrl: string;
  postNumber: string;
  description: string;
  latitude: number;
  longitude: number;
  businessImageUrl: string;
  address: string;
  addressDetail: string;
  createDt: string;
}

export interface Menu {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  sort: number;
  storeId: string;
}

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  contents: string;
  tasteRate: number;
  cleanRate: number;
  moodRate: number;
  kindRate: number;
  storeId: string;
  createDt: string | Date;
}

export interface Alarm {
  id: string;
  name: string;
  sendType: number;//1 전체, 2 식당, 3 특정 
  sendUserIdList: string;
  contents: string;

  repeat: boolean;

  weekDays: number;
  hour: number;
  minute: number;

  imageUrl: string;

  createDt: string;

  kimageId: string;
}

export interface Kimage {
  id: string;
  name: string;
  desc: string;
  keywords: string;
  imageUrl: string;
  createDt: string;
}

export interface Keyword {
  id: string;
  content: string;
  imageId: string;
}

export interface User {
  id: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  storeBirth: string | null;
  gender: string;
  email: string;
  birth: string;
  createDt: string;
  fcmToken: string;
  normalBirth: string | null;
  normalGender: string | null;
  normalName: string | null;
  normalNickname: string | null;
  normalPhone: string | null;
  storeGender: string | null;
  storeName: string | null;
  storeNickname: string | null;
  storePhone: string | null;
  thumbnailUrl: string;
  userTypeExt: string;
}

export interface Point {
  id: string;
  createDt: string;
  point: number;
  userId: string;
  reserveId: string;
}

export const DurationType = ["일별", "주별", "월별"] as const;
export type Duration = (typeof DurationType)[number];

export const FilterType = ["최신순", "가격순", "참여인원순"] as const;
export type Filter = (typeof FilterType)[number];
