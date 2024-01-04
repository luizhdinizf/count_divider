import { useState, useEffect } from 'react';
import axios from 'axios';
import NumberPicker from "react-widgets/NumberPicker";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

export default function ItemTable(props) {
    const [items, setItems] = useState([]);
    const [result, setResult] = useState();
    function senditems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }


    function getItems() {
        const items = JSON.parse(localStorage.getItem('items'));
        if (items) {
            setItems(items);
        }
    }
    useEffect(() => {
        getItems();
    }, []);


    function pushItem(item, price, quantity) {
        let new_items = [...items, { item: item, price: price, quantity: quantity }];
        setItems(new_items);
        senditems(new_items);
    }
    function removeItem(name, price, quantity) {
        let new_items = items.filter((item) => item.item !== name);
        console.log(new_items)
        setItems(new_items);
        senditems(new_items);
    }
    function setTip(gorjeta) {
        localStorage.setItem('tip', JSON.stringify(1+gorjeta/100));
    }



    return (
        <div>
            <Table striped hover >
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Preço</th>
                    </tr>
                </thead>
                <tbody>
                    {props.editable && <InputItem onClick={(item, price, quantity) => pushItem(item, price, quantity)} />}
                    {items.map((item) => (
                        <tr>
                            <td>{item.item}</td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            
                            <td>{props.editable && <Button variant='danger' onClick={() => removeItem(item.item, item.price, item.quantity)}>Remove</Button>}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {props.editable && <div>
                Gorjeta:
                <NumberPicker defaultValue={10} onChange={(gorjeta) => setTip(gorjeta)} />
            </div>}
        </div>
    );
}

export function InputItem({ onClick }) {
    const [item, setitem] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    function handleChangeitem(e) {
        setitem(e.target.value);
    }


    function handleClick() {
        onClick(item, price, quantity);
    }
    return (
        <tr>
            <td><input type="text" value={item} onChange={handleChangeitem} className="form-control" /></td>
            <td><NumberPicker onChange={(quantity) => setQuantity(quantity)} /></td>
            <td><NumberPicker onChange={(price) => setPrice(price)} /></td>
            <td><Button onClick={handleClick}>Add</Button></td>
        </tr>
    );
}