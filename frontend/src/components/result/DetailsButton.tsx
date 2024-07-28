import { ReactElement, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import DetailsWindow from "../popup/DetailsWindow";
import SearchResult from "../../types/SearchResult";
import Response from "../../types/Response";

interface DetailsButtonProps {
  result: SearchResult
  setResponse: (response: Response) => void;
}

export default function DetailsButton ({ result, setResponse }: DetailsButtonProps): ReactElement {
  // hook is used to track state of popup window
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
    return (
        <div>
          <Tooltip
            title="More Details"
            placement="bottom"
            arrow = { true }
          >
              <Button
                  onClick = { handleOpen }
                  variant = "contained"
                  color = "primary"
                  startIcon={<InfoIcon style={{ fontSize: 20 }} />}
                  sx = {{
                      minWidth: '30px',
                      maxWidth: '30px',
                      minHeight: '30px',
                      maxHeight: '30px',
                      padding: '0',
                      margin: '0',
                      '& .MuiButton-startIcon': {
                        margin: '0',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '16px',
                      },
                  }}
              >
              </Button>
          </Tooltip>
          <DetailsWindow result = {result} open = {open} handleClose = {handleClose} setResponse = {setResponse}></DetailsWindow>
        </div>
        
      );
}