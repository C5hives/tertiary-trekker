import SearchResult from "../../types/SearchResult";

interface PopupWindowProps {
    result: SearchResult;
    open: boolean
    handleClose: (open: boolean) => void
}

export default PopupWindowProps;