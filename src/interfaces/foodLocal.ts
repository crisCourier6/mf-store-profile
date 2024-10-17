import { FoodExternal } from "./foodExternal"
import { StoreHasFood } from "./StoreHasFood"

export interface FoodLocal{
    id:string
    name:string
    picture:string
    foodData:FoodExternal
    storeHasFood?:StoreHasFood
}