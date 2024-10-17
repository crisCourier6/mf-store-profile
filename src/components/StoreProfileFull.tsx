import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box, Avatar, DialogActions, 
    Button, Divider, Paper, TextField, FormControlLabel, Switch, Card, CardContent, CardMedia } from '@mui/material';
import api from '../api';
import { StoreProfile } from '../interfaces/StoreProfile';
import { CommentStore } from '../interfaces/CommentStore';
import NoPhotoIcon from "../../public/NoPhotoIcon"
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import dayjs, { Dayjs } from 'dayjs';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { useNavigate } from 'react-router-dom';
import { StoreHasFood } from '../interfaces/StoreHasFood';

interface StoreProfileProps {
    store: StoreProfile;
    comments: CommentStore[];
    open: boolean;
    scrollToComments: boolean;
    onClose: () => void;
    onUpdateComment: (updatedComment: CommentStore) => void;
    onDeleteComment: (commentId: string) => void;
    onNewComment: (newComment: CommentStore) => void;
}

const StoreProfileFull: React.FC<StoreProfileProps> = ({ store, comments, open, onClose, onUpdateComment, onDeleteComment, onNewComment, scrollToComments }) => {
    const navigate = useNavigate()
    const [localComments, setLocalComments] = useState<CommentStore[]>([]);
    const currentUserId = window.localStorage.id
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedComment, setSelectedComment] = useState<CommentStore | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [editedIsRecommended, setEditedIsRecommended] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [isRecommended, setIsRecommended] = useState(false);
    const [showCatalogue, setShowCatalogue] = useState(false)
    const [expandedComments, setExpandedComments] = useState(false);
    const commentsURL = "/comments-store"
    const commentsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    useEffect(() => {
        console.log(open, scrollToComments, commentsRef)
        if (open && scrollToComments) {
            setExpandedComments(true)
            // Scroll to the comments section when the ExpertProfile opens
            setTimeout(() => {
                if (commentsRef.current) {
                    commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 0); // Timeout to ensure the DOM has updated
        }
    }, [open, scrollToComments]);

    const handleUpdateComment = () => {
        if (selectedComment) {
            const updatedComment = {
                ...selectedComment,
                content: editedContent,
                isRecommended: editedIsRecommended,
            };

            api.patch(`${commentsURL}/${selectedComment.id}`, updatedComment, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + window.localStorage.token },
            })
                .then(res => {
                    onUpdateComment(updatedComment)
                })
                .catch(error => {
                    console.log(error);
                });
        }
        setShowEditDialog(false);  // Close dialog after updating
    }

    const handleFoodClick = (id:string) => {
        navigate("/food/" + id)
    }

    const handleDeleteComment = () => {
        if (selectedComment) {
            api.delete(`${commentsURL}/${selectedComment.id}`, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + window.localStorage.token },
            })
                .then(res => {
                    onDeleteComment(selectedComment.id)
                })
                .catch(error => {
                    console.log(error);
                });
        }
        setShowDeleteDialog(false);  // Close dialog after deleting
    }

    const openCreateDialog = () => setShowCreateDialog(true);
    const closeCreateDialog = () => setShowCreateDialog(false);

    const handleCreateComment = () => {
        const newComment = {
            content: newCommentContent,
            isRecommended,
            userId: currentUserId,
            storeId: store.userId
        };
        
        // Call your API to create a comment
        api.post(commentsURL, newComment, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        }).then(res => {
            onNewComment(res.data);  // Call the parent's new comment function
            setNewCommentContent("");  // Clear the input fields after creating
            setIsRecommended(false);
            closeCreateDialog();
        }).catch(error => {
            console.log(error);
        });
    };
    

    const openEditDialog = (comment: CommentStore) => {
        setSelectedComment(comment);
        setEditedContent(comment.content || "");
        setEditedIsRecommended(comment.isRecommended || false);
        setShowEditDialog(true);
    };

    // Open the delete confirmation dialog
    const openDeleteDialog = (comment: CommentStore) => {
        setSelectedComment(comment);
        setShowDeleteDialog(true);
    };

    const toggleExpand = () => {
        setExpandedComments(prev => !prev);
    };

    return (
        <Dialog 
        open={open} 
        onClose={onClose} 
        fullScreen
        PaperProps={{
            sx: {
                maxHeight: '80vh', 
                width: "95vw",
                maxWidth: "500px"
            }
        }}>
            <DialogTitle sx={{padding:0.5, bgcolor: "primary.dark"}}>
            <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: "center", 
                    flexDirection: "column",
                    gap: 0.5
                }}>
                   <Avatar
                        alt={store.user?.name}
                        sx={{ width: 64, height: 64, bgcolor :"transparent" }}
                       
                    >
                        {store.user?.profilePic === "default_profile.png" ? (
                            <NoPhotoIcon height={48} width={48} fill='white' /> // Render the icon when it's the default profile picture
                        ) : (
                            <img
                                src={store.user?.profilePic}
                                alt={store.user?.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                    </Avatar> 
                    <Typography variant='h6' width="100%"  color="primary.contrastText" textAlign={"center"}>
                        {store.user?.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{padding:1}}>
                <Typography variant='h6'>
                    Descripción
                </Typography>
                <Typography variant="subtitle2" textAlign={"justify"}>
                    {store.description}
                </Typography>
                <Divider sx={{my:1}}/>
                <Typography variant='h6'>
                    Información
                </Typography>
                <Typography 
                variant='subtitle2' 
                color= "primary.dark" 
                sx={{
                    textAlign:"left", 
                    ml:1, 
                    alignItems: "center", 
                    justifyContent: "start", 
                    display: "flex", 
                    gap:1
                }}>
                    <EmailRoundedIcon sx={{fontSize:20}}/>{store.user?.email}
                </Typography>
                {store.phone?
                    <Typography 
                    variant='subtitle2' 
                    color= "primary.dark" 
                    sx={{
                        textAlign:"left", 
                        ml:1, 
                        alignItems: "center", 
                        justifyContent: "start", 
                        display: "flex", 
                        gap:1
                    }}>
                        <LocalPhoneRoundedIcon sx={{fontSize:20}}/>{store.phone}
                    </Typography>
                :null}
                {store.address?
                    <Typography 
                    variant='subtitle2' 
                    color= "primary.dark" 
                    sx={{
                        textAlign:"left", 
                        ml:1, 
                        alignItems: "center", 
                        justifyContent: "start", 
                        display: "flex", 
                        gap:1
                    }}>
                        <PlaceRoundedIcon sx={{fontSize:20}}/>{store.address}
                    </Typography>
                    :null
                }
                <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", mt:1}}> 
                    <Button variant='inverted'  sx={{p:0.5, fontSize:12}}>
                        {store.webPage?<a 
                                href={store.webPage?.startsWith('http')? store.webPage : `https://${store.webPage}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#22323f', textDecoration: 'none' }}
                            >
                                Ver página web
                        </a>:<>Sin página web</>}
                    </Button>
                    {store.storeHasFood.length>0?
                        <Button onClick={()=> setShowCatalogue(true)} variant='inverted' sx={{p:0.5, fontSize:12}}>
                            Ver catálogo
                        </Button>
                    :null}
                </Box>
                <Divider sx={{my:1}}/>
                <Typography variant="h6" onClick={toggleExpand} sx={{ cursor: 'pointer' }}>
                    Comentarios {expandedComments ? "▲" : "▼"}
                </Typography>
                {expandedComments && 
                <Box ref={commentsRef} sx={{ 
                    display: 'flex', 
                    width: "100%",
                    alignItems: 'center', 
                    justifyContent: "center", 
                    flexDirection: "column",
                    gap:1,
                }}>
                    {localComments.map(comment => {
                        return (
                            <Box key={comment.id} sx={{ 
                                display: 'flex', 
                                width: "100%",
                                flexDirection: "column",
                                border: "2px solid",
                                borderColor: "primary.dark",
                                gap: 0.5,
                            }}> 
                                <Paper sx={{
                                    width:"100%", 
                                    bgcolor: comment.isRecommended?"secondary.main":"primary.dark", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderRadius:0
                                }}>
                                    <Typography 
                                    variant="subtitle1" 
                                    color={comment.isRecommended?"secondary.contrastText":"primary.contrastText"}
                                    sx={{flexGrow: 1, textAlign: "left", width: "80%", pl:1}}
                                    >
                                        {comment.user?.name} 
                                    </Typography>
                                    {comment.isRecommended && 
                                        <GradeOutlinedIcon sx={{color: "primary.dark", width: "20%", textAlign: "right"}}/>
                                    }
                                </Paper>
                                <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                                    <Typography variant="subtitle2" textAlign={"justify"} sx={{px:1}}>
                                        {comment.content}
                                    </Typography>
                                    <Typography variant="subtitle2" textAlign={"right"} sx={{px:1, fontStyle: "italic"}}>
                                        {dayjs(comment.createdAt).format("DD/MM/YYYY")}
                                    </Typography>
                                </Box>
                                <Paper sx={{
                                    width:"100%", 
                                    bgcolor: comment.isRecommended?"secondary.main":"primary.dark", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "start",
                                    borderRadius:0
                                }}>
                                    <Box sx={{ display: "flex", flexDirection: "row-reverse", width:"100%", gap: 0.5 }}> {/* Wrap icons in a box for layout */}
                                        {comment.userId === currentUserId && 
                                            <>
                                                <IconButton size="small" onClick={() => openEditDialog(comment)}>
                                                    <EditRoundedIcon sx={{ 
                                                        color: comment.isRecommended ? "secondary.contrastText" : "primary.contrastText",
                                                        fontSize: 18
                                                    }}/>
                                                </IconButton>
                                            </>
                                        }                   
                                        {comment.userId === currentUserId && 
                                            <>
                                                <IconButton size="small" onClick={() => openDeleteDialog(comment)}>
                                                    <DeleteForeverRoundedIcon sx={{ 
                                                        color: comment.isRecommended ? "secondary.contrastText" : "primary.contrastText", 
                                                        fontSize:18
                                                    }} />
                                                </IconButton>
                                            </>
                                        }   
                                    </Box>
                                </Paper>

                            </Box>
                        )
                    })}
                </Box>
                }
            </DialogContent>
            <DialogActions>
                {currentUserId!=store.userId && <>
                <Button variant='contained' onClick={openCreateDialog}>
                    Comentar
                </Button>
                </>}
                <Button
                    onClick={onClose}
                    variant="contained"
                >
                    Cerrar
                </Button>
            </DialogActions>
            {/* Edit Comment Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}
                PaperProps={{
                    sx: {
                        maxHeight: '80vh', 
                        width: "85vw",
                        maxWidth: "450px"
                    }
                }} 
            >
                <DialogTitle>Editar Comentario</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editedIsRecommended}
                                onChange={(e) => setEditedIsRecommended(e.target.checked)}
                            />
                        }
                        label={editedIsRecommended? "Recomendado": "No recomendado"}
                    />
                    <TextField
                        fullWidth
                        label="Comentario"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateComment} variant="contained" disabled={editedContent==""}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Comment Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Borrar comentario</DialogTitle>
                <DialogContent>
                    <Typography>¿Seguro que quieres borrar tu comentario?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteComment} variant="contained" color="error">Borrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showCreateDialog} onClose={closeCreateDialog}
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "85vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle>Nuevo comentario</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isRecommended}
                                onChange={() => setIsRecommended(!isRecommended)}
                            />
                        }
                        label={isRecommended? "Recomendado": "No recomendado"}
                    />
                    <TextField
                        label="Comentario"
                        fullWidth
                        multiline
                        rows={4}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog}>Cancelar</Button>
                    <Button onClick={handleCreateComment} variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showCatalogue} onClose={()=>setShowCatalogue(false)}
            fullScreen
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "95vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle sx={{padding:0.5, bgcolor: "primary.dark", color: "primary.contrastText", textAlign: "center"}}>
                    Catálogo de {store.user?.name}
                </DialogTitle>
                <DialogContent>
                    {store.storeHasFood?.map((item:StoreHasFood) => {return (
                        <Card key={item.foodLocalId} sx={{
                            border: "4px solid", 
                            borderColor: "primary.dark", 
                            bgcolor: "primary.contrastText",
                            width:"100%", 
                            height: "10vh", 
                            minHeight: "60px",
                            maxHeight: "120px", 
                            display:"flex",
                            my:1
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
                                bgcolor: "primary.dark"
                                }}>
                                    <Typography 
                                    variant="subtitle1" 
                                    width="100%" 
                                    height="70%" 
                                    sx={{alignContent:"center", borderBottom: "4px solid", borderColor: "primary.main", cursor:"pointer", bgcolor: "primary.contrastText"}}
                                    onClick={()=> handleFoodClick(item.foodLocalId)}>
                                        {item.foodLocal.name}
                                    </Typography>
                                    <Box sx={{
                                    width:"100%", 
                                    display:"flex", 
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    height: "30%",
                                    bgcolor: "primary.dark"
                                    }}>
                                        {item.isAvailable
                                            ?<Typography variant='subtitle2' sx={{color:"secondary.main"}}>Disponible</Typography>
                                            :<Typography variant='subtitle2' sx={{color:"warning.main"}}>Agotado</Typography>
                                        }
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    )}
                    
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={()=>setShowCatalogue(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
        
    );
};

export default StoreProfileFull;