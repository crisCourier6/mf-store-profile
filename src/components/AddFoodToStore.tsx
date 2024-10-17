import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api';
import { Typography, Alert, Button, Snackbar, SnackbarCloseReason, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const AddFoodToStore: React.FC= () => {
    const {id} = useParams()
    const storeHasFoodURL = "/catalogue"
    const [foodInCatalogue, setFoodInCatalogue] = useState(false)
    const currentStoreId = window.localStorage.s_id
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)

    useEffect(()=>{
        const queryParams = `?s=${currentStoreId}&f=${id}`
        api.get(`${storeHasFoodURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(res => {
            if (res.data.length > 0){
                setFoodInCatalogue(true)
            }
        })
        .catch(error => {
            console.log(error.response.data.message)
        })
        .finally(()=>{
            setAllDone(true)
        })
    },[])

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }

    const onAddFood = () => {
        if (!foodInCatalogue){
            let newFood = {
                storeId: currentStoreId,
                foodLocalId: id,
                isAvailable: true
            }
            api.post(`${storeHasFoodURL}`, newFood, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            })
            .then((res) => {
                setSnackbarOpen(true);
                setSnackbarMsg("Alimento agregado al catálogo!")
                setFoodInCatalogue(true)
            })
            .catch((error) => {
                console.error(error);
                setSnackbarOpen(true)
                setSnackbarMsg(error.response.data.message)
            });
        }
        else{
            api.delete(`${storeHasFoodURL}/bystoreandfood/${currentStoreId}/${id}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            })
            .then((res) => {
                setSnackbarOpen(true);
                setSnackbarMsg("Alimento eliminado del catálogo!")
                setFoodInCatalogue(false)
            })
            .catch((error) => {
                console.error(error);
                setSnackbarOpen(true)
                setSnackbarMsg(error.response.data.message)
            });
        }
        
    };

    
    return (
        <>
            <Button onClick={onAddFood}
                variant="dark" 
                fullWidth
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding:0.2,
                    borderRadius:0,
                    border: "transparent",
                    "&:hover": {border: "transparent"}
                }}
            >
                {allDone
                    ?foodInCatalogue
                        ?<>
                            <RemoveIcon sx={{fontSize: {xs:20, sm:25}}}></RemoveIcon>
                            <Typography variant='subtitle2' color={"inherit"} sx={{fontSize: {xs:12, sm:14}}}>
                                Eliminar del catálogo
                            </Typography>
                        </>
                        :<>
                            <AddIcon sx={{fontSize: {xs:20, sm:25}}}></AddIcon>
                            <Typography variant='subtitle2' color={"inherit"} sx={{fontSize: {xs:12, sm:14}}}>
                                Agregar al catálogo
                            </Typography>
                        </>
                    :<CircularProgress sx={{color: "warning.main"}}/>
                }
                
                
            </Button> 
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMsg}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AddFoodToStore;