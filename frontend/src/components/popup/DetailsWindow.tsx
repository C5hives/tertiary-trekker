import { Box, Modal } from "@mui/material";
import { ReactElement } from "react";
import LeftPanel from "./leftPanel/LeftPanel";
import RightPanel from "./rightPanel/RightPanel";
import { Divider } from '@mui/material';
import SearchResult from "../../types/SearchResult";
import Response from '../../types/Response';

interface DetailsWindowProps {
  result: SearchResult;
  open: boolean
  handleClose: (open: boolean) => void
  setResponse: (response: Response) => void;
}

export default function DetailsWindow({ result, open, handleClose, setResponse }: DetailsWindowProps): ReactElement {
  return (
    <div>
      <Modal
        open = { open }
        onClose = { handleClose }
      >
        <Box sx = {{
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
            gap: '1%',
            padding: 2,
        }}>
            <LeftPanel result = {result}></LeftPanel>
            <Divider orientation = "vertical"></Divider>
            <RightPanel id = {result.id} setResponse = {setResponse}></RightPanel>
        </Box>
      </Modal>
    </div>
  );
}