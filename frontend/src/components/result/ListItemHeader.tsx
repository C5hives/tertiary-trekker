import { ReactElement } from 'react';

import DocumentInfoProps from '../props/DocumentInfoProps';

import '../../styles/result/ListItemHeader.css';
import TitleText from './TitleText';
import DetailsButton from './DetailsButton';

export default function ListItemHeader ({ result }: DocumentInfoProps): ReactElement {
    return (
        <div className = 'title'>
            <TitleText url = {result.url} title = {result.title}></TitleText>
            <DetailsButton result = {result}></DetailsButton>
        </div>
    );
};

