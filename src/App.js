import React from "react";
import axios from 'axios';


import './App.css';
import SearchForm from "./SearchForm";
import List from "./List";

const  API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';


const useSemiPersistentState = (key, initialState) => {
    const isMounted = React.useRef(false);

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        console.log('A');
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            localStorage.setItem(key, value);
        }
    }, [value, key]);

    return [value, setValue];
};

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data:
                    action.payload.page === 0 ?
                        action.payload.list : state.data.concat(action.payload.list),
                page: action.payload.page,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    story => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

const getSumComments = stories => {
    console.log('C');

    return stories.data.reduce(
        (result, value) => result + value.num_comments, 0
    );
};

const extractSearchTerm = url => url.substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');
const getLastSearches = urls => urls.reduce((result, url, index) => {
    const searchTerm = extractSearchTerm(url);
    if (index === 0) {
        return result.concat(searchTerm);
    }
    const previousSearchTerm = result[result.length - 1];
    if (searchTerm === previousSearchTerm) {
        return result;
    } else {
        return result.concat(searchTerm);
    }
    }, []).slice(-6).slice(0,-1);

const getUrl = (searchTerm, page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const App = () => {
    console.log('B:App');

    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [urls, setUrls] = React.useState(
        [getUrl(searchTerm,0)]
    );

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], page: 0, isLoading: false, isError: false }
    );

    const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

    const handleFetchStories = React.useCallback(async () => {
        dispatchStories({ type: 'STORIES_FETCH_INIT' });

        try {
            const lastUrl = urls[urls.length - 1];
            const result = await axios.get(lastUrl);

            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: {
                    list: result.data.hits,
                    page: result.data.page,
                },
            });
        } catch {
            dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
        }
    }, [urls]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = React.useCallback(item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    }, []);

    const handleSearchInput = event => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = event => {
        handleSearch(searchTerm,0);

        event.preventDefault();
    };

    const handleLastSearch = searchTerm => {
        setSearchTerm(searchTerm);
        handleSearch(searchTerm, 0);
    };

    const handleSearch = (searchTerm,page) => {
        const url = getUrl(searchTerm, page);
        setUrls(urls.concat(url));
    }

    const lastSearches = getLastSearches(urls);

    //This function handles pagination of search results
    const handleMore = () => {
        const lastUrl  = urls[urls.length - 1];
        const searchTerm = extractSearchTerm(lastUrl);
        handleSearch(searchTerm, stories.page + 1);
    }

    return (
        <div className="container">
            <h1 className="headline-primary">My Hacker Stories with {sumComments} comments</h1>

            <LastSearches
                lastSearches={lastSearches}
                onLastSearch={handleLastSearch}
            />

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />


            {stories.isError && <p>Something went wrong ...</p>}

            <List list={stories.data} onRemoveItem={handleRemoveStory} />
            {stories.isLoading ? (
                <p>Loading ...</p>
            ) : (
                <button className={"button button_large"} type={"button"} onClick={handleMore}>
                    More
                </button>
            )}

        </div>
    );
};

const LastSearches = ({lastSearches, onLastSearch}) => (
    <>
        {lastSearches.map((searchTerm, index) => (
            <button className={"button button_medium"} key={searchTerm + index} type={"button"} onClick={()=> onLastSearch(searchTerm)}>
                {searchTerm}
            </button>
        ))}

    </>
);




export default App;

