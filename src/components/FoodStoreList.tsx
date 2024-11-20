import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, IconButton, Typography, Button, Dialog, DialogActions, 
    DialogContent, SnackbarCloseReason, CardActions, DialogTitle } from '@mui/material';
import { useParams } from 'react-router-dom';
import { CommentStore } from '../interfaces/CommentStore';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import { StoreProfile } from '../interfaces/StoreProfile';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreProfileFull from './StoreProfileFull';

const FoodStoreList: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const [openList, setOpenList] = useState(false)
    const {id} = useParams()
    const storesURL = "/store-profile"
    const commentsURL = "/comments-store"
    const [stores, setStores] = useState<StoreProfile[]>([])
    const [comments, setComments] = useState<CommentStore[]>([])
    const currentUserId = window.localStorage.id;
    const [storesFiltered, setStoresFiltered] = useState<StoreProfile[]>([])
    const [searchQuery, setSearchQuery] = useState("");
    // const [allDone, setAllDone] = useState(false)
    const [storeStats, setStoreStats] = useState<{ 
        [storeId: string]: { 
            recommendationCount: number; 
            totalComments: number;
            userHasCommented: boolean;
            userHasRecommended: boolean;
        } 
    }>({});
    const [openStore, setOpenStore] = useState(false)
    const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null)
    const [selectedComments, setSelectedComments] = useState<CommentStore[]>([])
    const [scrollToComments, setScrollToComments] = useState(false)
    const commentsQueryParams = "?wu=true&ws=true"
    

    useEffect(() => {
        if (openList){
            let storesQueryParams = "?wu=true&wc=true"
        if (id){
            storesQueryParams += `&f=${id}`
        }
        console.log(`${storesURL}${storesQueryParams}`)
        const fetchStores = api.get(`${storesURL}${storesQueryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        });
    
        const fetchComments = api.get(`${commentsURL}${commentsQueryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        });
    
        Promise.all([fetchStores, fetchComments])
            .then(([storesResponse, commentsResponse]) => {
                console.log("Stores:", storesResponse.data);
                console.log("Comments:", commentsResponse.data);
                console.log("store stats: ", storeStats)
                const storesData = storesResponse.data;
                const commentsData = commentsResponse.data;
                setStores(storesData);
                setComments(commentsData);
                setStoresFiltered(storesData);

                // Create a map to count recommendations for each expert
                const stats: { [storeId: string]: any } = {};
                commentsData.forEach((comment: CommentStore) => {
                    const storeId = comment.storeId;

                    if (!stats[storeId]) {
                        stats[storeId] = {
                            recommendationCount: 0,
                            totalComments: 0,
                            userHasCommented: false,
                            userHasRecommended: false,
                        };
                    }

                    // Increment total comments
                    stats[storeId].totalComments++;

                    // Increment recommendations if the comment is recommended
                    if (comment.isRecommended) {
                        stats[storeId].recommendationCount++;
                    }

                    // Check if the logged-in user has commented/recommended
                    if (comment.userId === currentUserId) {
                        stats[storeId].userHasCommented = true;
                        if (comment.isRecommended) {
                            stats[storeId].userHasRecommended = true;
                        }
                    }
                    setStoreStats(stats);
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
            // .finally(() => {
            //     setAllDone(true); // Set the flag after both requests have completed
            // });
        }
    }, [openList]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setStoresFiltered(stores);
        } else {
            setStoresFiltered(
                stores.filter(store =>
                    store.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
      }, [searchQuery, stores]);

    useEffect(()=>{
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100); // Adjust the delay as needed
    }, [storesFiltered])

    useEffect(()=>{
        const stats: { [storeId: string]: any } = {};
        comments.forEach((comment: CommentStore) => {
            const storeId = comment.storeId;

            if (!stats[storeId]) {
                stats[storeId] = {
                    recommendationCount: 0,
                    totalComments: 0,
                    userHasCommented: false,
                    userHasRecommended: false,
                };
            }

            // Increment total comments
            stats[storeId].totalComments++;

            // Increment recommendations if the comment is recommended
            if (comment.isRecommended) {
                stats[storeId].recommendationCount++;
            }

            // Check if the logged-in user has commented/recommended
            if (comment.userId === currentUserId) {
                stats[storeId].userHasCommented = true;
                if (comment.isRecommended) {
                    stats[storeId].userHasRecommended = true;
                }
            }      
        })
        setStoreStats(stats);
        if (selectedStore){
            const storeComments = comments.filter(comment => comment.storeId === selectedStore.userId);
            setSelectedComments(storeComments); // Assuming you have state to hold expert comments
        }
    }, [comments])

    const handleOpenStore = (store: StoreProfile) => {
        setSelectedStore(store);
        const storeComments = comments.filter(comment => comment.storeId === store.userId);
        setSelectedComments(storeComments); // Assuming you have state to hold expert comments
        setOpenStore(true);
    };

    const handleCloseStore = () => {
        setOpenStore(false);
        setSelectedStore(null);
    };

    const updateComment = (updatedComment: CommentStore) => {
        setComments((prevComments) =>
            prevComments.map((comment) =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        );
    };

    // Function to delete a comment
    const deleteComment = (commentId: string) => {
        setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== commentId)
        );
    };

    const newComment = (newComment: CommentStore) => {
        setComments(prevComments => [newComment, ...prevComments]);
    };

    return ( 
        <>
            <Button onClick={()=>setOpenList(true)}
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
                <StorefrontIcon sx={{fontSize: {xs:20, sm:25}}}></StorefrontIcon>
                <Typography variant='subtitle2' color={"inherit"} sx={{fontSize: {xs:12, sm:14}}}>
                    Tiendas
                </Typography>
                </Button>
            <Dialog 
                open={openList} 
                onClose={()=>setOpenList(false)} 
                fullScreen
                PaperProps={{
                    sx: {
                        maxHeight: '80vh', 
                        width: "95vw",
                        maxWidth: "500px"
                    }
                }}>
                    <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText", textAlign: "center"}}>
                        Tiendas
                    </DialogTitle>
                    <DialogContent dividers sx={{padding:1}}>
                        <Box sx={{ 
                            display: 'flex', 
                            width: "100%",
                            alignItems: 'center', 
                            justifyContent: "center", 
                            flexDirection: "column",
                            gap:1,
                        }}>
                
                            {storesFiltered.map((store)=>{
                            const stats = storeStats[store.userId] || {
                                recommendationCount: 0,
                                totalComments: 0,
                                userHasCommented: false,
                                userHasRecommended: false,
                            };
                            return (
                            <Card key={store.id} sx={{
                            border: "4px solid", 
                            borderColor: "primary.dark", 
                            bgcolor: "primary.dark",
                            width:"90%", 
                            height: "20vh",
                            maxHeight: "120px", 
                            minHeight: "60px",
                            display:"flex",
                            flexDirection: "column"
                            }}>
                                <CardContent sx={{
                                width:"100%",
                                height: "75%", 
                                display:"flex", 
                                flexDirection: "row", 
                                justifyContent: "center",
                                alignItems: "center",
                                padding:0,
                                }}>
                                    <Box sx={{
                                        width:"100%", 
                                        height: "100%",
                                        display:"flex", 
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                    }}>
                                        <Typography 
                                            variant="h6" 
                                            color="secondary.contrastText" 
                                            width="100%" 
                                            sx={{alignContent:"center", 
                                                textAlign: "center",
                                                borderBottom: "2px solid", 
                                                borderColor: "primary.main", 
                                                bgcolor: "secondary.main"}}
                                            >
                                            {store.user?.name}
                                        </Typography>
                                        <Typography 
                                        variant='subtitle2' 
                                        color= "primary.dark" 
                                        width="100%"
                                        height="100%"
                                        sx={{
                                            textAlign:"left", 
                                            alignItems: "center", 
                                            justifyContent: "center", 
                                            display: "flex", 
                                            gap:1,
                                            height: "100%",
                                            bgcolor: "primary.contrastText"
                                        }}>
                                            {store.description}
                                        </Typography>
                                        <Box sx={{
                                            width:"100%", 
                                            display:"flex", 
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            bgcolor: "secondary.main"
                                        }}>     
                                        </Box>
                                            
                                    </Box>
                                    
                                    
                        
                                </CardContent>
                                <CardActions sx={{padding:0, width:"100%", height: "25%"}}>
                                <Box sx={{
                                    width:"100%", 
                                    display:"flex", 
                                    height: "100%",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    bgcolor: "primary.dark",
                                    }}>
                                        <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap:0
                                        }}>
                                            <IconButton disabled={true}>
                                            {stats.userHasRecommended ? <GradeRoundedIcon sx={{color: "secondary.main", fontSize:18}} /> : <GradeOutlinedIcon sx={{color: "primary.contrastText", fontSize:18}}/>}
                                            </IconButton>
                                            <Typography variant="subtitle1" color="primary.contrastText">{stats.recommendationCount}</Typography>
                                        </Box>
                                        <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap:0
                                        }}>
                                            <IconButton onClick={() => {
                                                handleOpenStore(store)
                                                setScrollToComments(true)
                                            }}>
                                                {stats.userHasCommented ? <CommentRoundedIcon sx={{color: "secondary.main", fontSize:18}}/> : <CommentOutlinedIcon sx={{color: "primary.contrastText", fontSize:18}}/>}
                                            </IconButton>
                                            <Typography variant="body2" color="primary.contrastText">{stats.totalComments}</Typography>
                                            
                                        </Box>
                                        <Button onClick={() => handleOpenStore(store)} variant='text' sx={{color: "secondary.main", fontSize:12, padding:0}}>
                                            Ver perfil
                                        </Button>
                                    </Box>
                                </CardActions>
                            </Card> 
                        )})}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                    <Button
                        onClick={()=>setOpenList(false)}
                        variant="contained"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {selectedStore && (
                <StoreProfileFull store={selectedStore} 
                comments={selectedComments} 
                open={openStore} 
                onClose={handleCloseStore} 
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                onNewComment={newComment}
                scrollToComments = {scrollToComments} />
            )}
        
        </>
    )
}

export default FoodStoreList;