import { ReactElement } from 'react';

import SearchResultProps from '../props/SearchResultProps';

import '../../styles/searchResult/ResultListItemHeader.css';
import TitleText from './TitleText';
import DetailsButton from './DetailsButton';

export default function ResultListItemTitle ({ result }: SearchResultProps): ReactElement {
    return (
        <div className = 'title'>
            <TitleText url = {result.url} title = {result.title}></TitleText>
            <DetailsButton result = {result}></DetailsButton>
        </div>
    );
};

