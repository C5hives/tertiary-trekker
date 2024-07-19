import { ReactElement, useState } from "react";
import SearchResultProps from "../props/SearchResultProps";
import Button from "@mui/material/Button";
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from "@mui/material/Tooltip";
import DetailsWindow from "../popupWindow/DetailsWindow";

export default function DetailsButton ({ result }: SearchResultProps): ReactElement {
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
          <DetailsWindow result = {result} open = {open} handleClose = {handleClose}></DetailsWindow>
        </div>
        
      );
}