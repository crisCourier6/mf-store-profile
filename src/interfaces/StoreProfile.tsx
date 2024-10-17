import { StoreHasFood } from "./StoreHasFood";
import { User } from "./User";
export interface StoreProfile {
    id: string,
    address?: string,
    description?: string,
    phone?: string,
    webPage?: string,
    userId: string,
    recommendationCount?:number
    userLikes?:boolean
    userComments?:boolean
    user?: User
    storeHasFood:StoreHasFood[]
}