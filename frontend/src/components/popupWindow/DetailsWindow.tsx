import { Box, Card, Modal, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import PopupWindowProps from "../props/PopupWindowProps";
import DocumentInfoDetailed from "./DocumentInfoDetailed";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: '70%',
    width: '70%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
    padding: 2,
};

export default function DetailsWindow({ result, open, handleClose }: PopupWindowProps): ReactElement {
  return (
    <div>
      <Modal
        open = { open }
        onClose = { handleClose }
        
      >
        <Box sx = {style}>
            <DocumentInfoDetailed result = {result}></DocumentInfoDetailed>
            <Card sx ={{height: '100%', width: '35%'}}>yooooo</Card>
        </Box>
      </Modal>
    </div>
  );
}