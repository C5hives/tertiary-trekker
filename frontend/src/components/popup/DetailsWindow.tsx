import { Box, Modal } from "@mui/material";
import { ReactElement, useState } from "react";
import PopupWindowProps from "../props/PopupWindowProps";
import DocumentInfoLeftPanel from "./leftPanel/DocumentInfoLeftPanel";
import FindSimilarButton from "./rightPanel/FindSimilarButton";
import SimilarDocumentList from "./rightPanel/SimilarDocumentList";
import SearchResult from "../../types/SearchResult";
import SimilarDocumentRightPanel from "./rightPanel/SimilarDocumentRightPanel";

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
            <DocumentInfoLeftPanel result = {result}></DocumentInfoLeftPanel>
            <SimilarDocumentRightPanel id = {result.id}></SimilarDocumentRightPanel>
        </Box>
      </Modal>
    </div>
  );
}