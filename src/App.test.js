import { render, screen } from '@testing-library/react';
import React from "react";
import renderer from 'react-test-renderer';
import App, {Item, List, SearchForm, InputWithLabel} from "./App";
import axios from 'axios';
// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

jest.mock('axios');

describe('App', () => {
  it('succeeds fetching data with a list', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url:'httpsL//redux.js.org',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const promise = Promise.resolve({
    data: {
      hits: list,
    },
  });
  axios.get.mockImplementationOnce(() => promise);

  const component = renderer.create(<App/>);

  expect(component.root.findByType(List).props.list).toEqual(list);
  });

  //test case 2
  it('fails fetching data with a list', async() => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);

    let component;
    await renderer.act(async () => {
      component = renderer.create(<App />);
    });
    expect(component.root.findByType('p').props.children).toEqual('Something went wrong...');
  })
});

//test-suite
describe('something truthy', () => {
  //test case 1
  it('true to be true', () => {
    //test assertion
    expect(true).toBe(true);
  });

  //test case 2
  test('false to be false', () => {
    //test assertion
    expect(false).toBe(false);
  });

});

describe('Item', () => {
  const item = {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectId: 0,
  };
  const handleRemoveItem = jest.fn();

  let component;

  beforeEach(() => {
    component = renderer.create(<Item item={item} onRemoveItem={handleRemoveItem} />);
  });
  //test-case 1
  it('renders all properties', () => {

    expect(component.root.findByType('a').props.href).toEqual('https://reactjs.org');

    expect(component.root.findAllByProps({children: 'Jordan Walke'}).length).toEqual(1);
  });

  //test-case 2
  it('calls onRemoveItem on button click', () => {

    component.root.findByType('button').props.onClick();

    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    expect(handleRemoveItem).toHaveBeenCalledWith(item);
    expect(component.root.findAllByType(Item).length).toEqual(1);
  });

  test('renders snapsot', () => {
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});

describe('List', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url:'httpsL//redux.js.org',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  //test case 1
  it('renders two items', () => {
    const component = renderer.create(<List list={list} />);

    expect(component.root.findAllByType(Item).length).toEqual(2);
  })

});

describe('Search Form', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };
  let component;
  beforeEach(() => {
    component = renderer.create(<SearchForm {...searchFormProps} />);
  });
  //test case 1
  it('renders the input fields with its value', () => {
    const value = component.root.findByType(InputWithLabel).props.value;
    expect(value).toEqual('React');
  });

  //test case 2
  it('changes the input field', () => {
    const pseudoEvent = {target: 'Redux'};

    component.root.findByType('input').props.onChange(pseudoEvent);

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledWith(pseudoEvent);
  });

  //test case 3
  it('disables the button and prevents submit', () => {
    component.update(<SearchForm {...searchFormProps} searchTerm={""} /> );

    expect(component.root.findByType('button').props.disabled).toBeTruthy();
  });
});
