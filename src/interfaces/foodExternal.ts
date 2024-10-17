export interface FoodExternal{
    id:string
    product_name?:string
    brands?: string,
    nutriments?: object,
    nutrient_levels?: object,
    allergens_tags?: string[],
    nova_group?: string,
    additives_tags?: string[],
    additives?:string[],
    environment_impact_level?: string,
    nutriscore_grade?: string,
    nutriscore_2023_tags?:string,
    ecoscore_grade?: string,    
    ingredients?: object,
    ingredients_text?:string,
    quantity?: string,
    serving_quantity?: string,
    serving_size?: string,
    traces_tags?: string[]
    image_nutrition_url?: string,
    image_url?: string,
    image_packaging_url?: string,
    image_ingredients_url?: string,
}