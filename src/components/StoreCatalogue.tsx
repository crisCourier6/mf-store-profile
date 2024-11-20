import React, { useEffect, useState } from 'react';
import api from '../api';
import { FoodLocal } from '../interfaces/foodLocal';
import { Box, Card, CardContent, CardMedia, Grid, IconButton, Typography, Alert, Backdrop, 
    Button, Dialog, DialogActions, DialogContent, Snackbar, SnackbarCloseReason, Switch, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import NoPhotoIcon from "../../public/NoPhotoIcon"
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { StoreHasFood } from '../interfaces/StoreHasFood';
import { StoreProfile } from '../interfaces/StoreProfile';

const StoreCatalogue: React.FC<{ isAppBarVisible: boolean, canEditCatalogue:boolean }> = ({ isAppBarVisible, canEditCatalogue }) => {
    const navigate = useNavigate()
    const {id } = useParams()
    const storeHasFoodURL = "/catalogue"
    const storeURL = "/store-profile"
    const [catalogue, setCatalogue] = useState<StoreHasFood[]>([])
    const [selectedFood, setSelectedFood] = useState<FoodLocal|null>(null)
    const [store, setStore] = useState<StoreProfile | null>(null)
    // const [foodsFiltered, setFoodsFiltered] = useState<FoodLocal[]>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [allDone, setAllDone] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const catalogueQueryParams = `?s=${id}&wf=true&ws=true`

    useEffect(()=>{
        document.title = "Catálogo - EyesFood";
        api.get(`${storeURL}/byId/${id}`, 
                {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + window.localStorage.token
                    }
                }) 
                .then( res => {
                    document.title = `Catálogo ${res.data.user.name} - EyesFood`;
                    setStore(res.data)
                })
                .catch(error=>{
                    console.log(error)
                })
    }, [])

    useEffect(()=>{
        api.get(`${storeHasFoodURL}${catalogueQueryParams}`, 
                {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + window.localStorage.token
                    }
                }) 
                .then( res => {
                    setCatalogue(res.data)
                    console.log(res.data)
                })
                .catch(error=>{
                    console.log(error)
                })
                .finally(()=>{
                    setAllDone(true)
                })
    }, [store])

    // useEffect(()=>{
    //     setTimeout(() => {
    //         window.scrollTo({ top: 0, behavior: 'smooth' });
    //     }, 100); // Adjust the delay as needed
    // }, [foodsFiltered])

    const handleFoodClick = (id:string) => {
        navigate("/food/" + id)
    }

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }

    const handleSwitchChange = (storeItem:StoreHasFood) => {
        setIsUpdating(true)
        const updatedStock = {
            foodLocalId: storeItem.foodLocalId,
            isAvailable: !storeItem.isAvailable
        }
        api.patch(`${storeHasFoodURL}/bystore/${store?.id}`,
            updatedStock,
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            }
        )
        .then(res => {
            setCatalogue(items => items.map((item) => {
                if (item.foodLocalId=== res.data.foodLocalId){
                    return {...res.data}
                }
                return item
            }))
            console.log(res.data)
        })
        .catch(error=>{
            console.log(error)
        })
        .finally(()=>{
            setIsUpdating(false)
        })
    }

    const handleFoodDelete = () => {
        api.delete(`${storeHasFoodURL}/bystoreandfood/${id}/${selectedFood?.id}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then((res) => {
            
            setSnackbarMsg("Alimento eliminado del catálogo!")
            setCatalogue(catalogue.filter((item:StoreHasFood)=>item.foodLocalId!==selectedFood?.id))
        })
        .catch((error) => {
            console.error(error);
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=>{
            setShowDeleteDialog(false)
            setSelectedFood(null)
            setSnackbarOpen(true);
        })
    }

    const handleDeleteDialog = (food:FoodLocal) => {
        setSelectedFood(food)
        setShowDeleteDialog(true)
    }

    return ( allDone?
        <Grid container display="flex" 
        flexDirection="column" 
        justifyContent="center"
        alignItems="center"
        sx={{width: "100vw", maxWidth:"500px", gap:2, flexWrap: "wrap", pb: 7}}
        >
            <Box 
                sx={{
                    position: 'sticky',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    maxWidth: "500px",
                    transition: "top 0.1s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: "5px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box"
                  }}
            >
                <Typography variant='h5' width="100%"  color="primary.contrastText" sx={{py:1, borderLeft: "3px solid",
                    borderRight: "3px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box",
                }}>
                    {canEditCatalogue
                        ?<> Mi catálogo </>
                        :<> {store?.user?.name} </>
                    }
                </Typography>
            </Box>
            
            { catalogue.map((item)=>{
                return (
                <Card key={item.foodLocalId} sx={{
                border: "4px solid", 
                borderColor: "primary.dark", 
                bgcolor: "primary.contrastText",
                width:"90%", 
                height: "15vh", 
                minHeight: "80px",
                maxHeight: "120px", 
                display:"flex",
                }}>
                    <CardMedia
                    sx={{
                        width: "25%",
                        borderRight: "4px solid",
                        borderColor: "primary.dark",
                        cursor: "pointer"
                    }}
                    title={item.foodLocal.name}
                    onClick={() => handleFoodClick(item.foodLocalId)}
                    >
                    {item.foodLocal.picture === "defaultFood.png" ? (
                        <NoPhotoIcon width={"100%"} height={"100%"}/>
                    ) : (
                        <img src={item.foodLocal.picture} alt={item.foodLocal.name} style={{ width: "100%" }} />
                    )}
                    </CardMedia>
                    <CardContent sx={{
                    width:"75%",
                    height: "100%", 
                    display:"flex", 
                    flexDirection: "column", 
                    justifyContent: "center",
                    alignItems: "center",
                    padding:0,
                    }}>
                        <Typography 
                        variant="body2" 
                        color="primary.dark" 
                        fontSize={15} 
                        fontFamily="Montserrat"
                        width="100%" 
                        height="60%" 
                        sx={{alignContent:"center", borderBottom: "4px solid", borderColor: "primary.main", cursor:"pointer"}}
                        onClick={()=> handleFoodClick(item.foodLocalId)}>
                            {item.foodLocal.name}
                        </Typography>
                        <Box sx={{
                        width:"100%", 
                        display:"flex", 
                        flexDirection: "row",
                        justifyContent: "space-between",
                        height: "40%",
                        bgcolor: "primary.dark"
                        }}>
                            <Box sx={{
                                width:"50%", 
                                display:"flex", 
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                height: "100%",
                                bgcolor: "primary.dark"
                            }}>
                                {item.isAvailable
                                    ?   <Typography variant="subtitle2" color={"secondary.main"}>
                                            Disponible
                                        </Typography>
                                    :   <Typography variant="subtitle2" color={"warning.main"}>
                                            Agotado
                                        </Typography>}
                                <Switch id={item.foodLocalId} 
                                checked={item.isAvailable} 
                                sx={{'& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'secondary.main', // Change the thumb color when checked
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'secondary.light', // Change the track color when checked
                                    },
                                    '& .MuiSwitch-track': {
                                        backgroundColor: 'warning.light', // Track color when unchecked
                                    },
                                    '& .MuiSwitch-switchBase': {
                                        color: 'warning.main', // Thumb color when unchecked
                                    },
                                }} 
                                size="small"
                                onChange={()=>handleSwitchChange(item)}
                                disabled={isUpdating}
                                
                                >
                                    
                                </Switch>
                            </Box>
                            {canEditCatalogue && <IconButton onClick={()=>handleDeleteDialog(item.foodLocal)}
                            sx={{
                                color: "error.main"
                            }}>
                                <DeleteForeverRoundedIcon fontSize="medium"/>
                            </IconButton>
                            }
                        </Box>
                    </CardContent>
                </Card>
                
                
                )
            })
            }
            <Backdrop open={showDeleteDialog} 
            sx={{width: "100vw"}}
            >
                
                <Dialog open={showDeleteDialog} scroll='paper' 
                sx={{width: "100%", 
                maxWidth: "500px", 
                margin: "auto"
                }}>
                    <DialogContent>
                        <Typography textAlign="justify">
                            ¿Borrar {selectedFood?.name} del catálogo?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>setShowDeleteDialog(false)} variant='contained'>
                            No
                        </Button>
                        <Button onClick={handleFoodDelete} variant='contained'>
                            Sí
                        </Button>
                    </DialogActions>
                </Dialog>
            </Backdrop>

            <Snackbar
                open = {snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                sx={{bottom: "3vh"}}
                >
                <Alert onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>  
   
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default StoreCatalogue;