export interface User {
    id: string,
    email?: string,
    name?: string,
    hash?: string,
    isActive?: boolean,
    isSuspended?: boolean,
    isPending?: boolean,
    activationToken?: string,
    activationExpire?: string,
    profilePic?: string,
    typeExternal?: string,
    externalId?: string,
    lastLogin?: Date,
    createdAt?: Date,
    updatedAt?: Date
}