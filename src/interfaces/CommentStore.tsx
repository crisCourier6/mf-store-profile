import { User } from "./User"

export interface CommentStore {
    id:string
    userId:string
    storeId:string
    createdAt?:Date
    content?:string
    isHidden?:boolean
    isRecommended?:boolean
    user?:User
    store?:User
}