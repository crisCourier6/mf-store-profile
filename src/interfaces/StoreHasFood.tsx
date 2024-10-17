import { FoodLocal } from "./foodLocal"
import { StoreProfile } from "./StoreProfile"

export interface StoreHasFood {
    storeId:string
    foodLocalId:string
    isAvailable:boolean
    storeProfile:StoreProfile
    foodLocal:FoodLocal
}