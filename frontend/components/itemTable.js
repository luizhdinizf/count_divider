import { useState, useEffect } from 'react';
import axios from 'axios';
import NumberPicker from "react-widgets/NumberPicker";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';

export default function ItemTable(props) {
    const this_tip = JSON.parse(localStorage.getItem('tip'))
    const [items, setItems] = useState([]);
    const [tip, setTip] = useState(this_tip ? this_tip : 0);
    const [show, setShow] = useState(false);
    const [currentItem, setCurrentItem] = useState();


    useEffect(() => {
        getItems();
    }, []);
    function senditems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }


    function getItems() {
        const items = JSON.parse(localStorage.getItem('items'));
        if (items) {
            setItems(items);
        }
    }

    function pushItem(item, price, quantity) {
        let new_items = [...items, { item: item, price: price, quantity: quantity }];
        setItems(new_items);
        senditems(new_items);
    }
    function removeItem(name) {
        let new_items = items.filter((item) => item.item !== name);
        console.log(new_items)
        setItems(new_items);
        senditems(new_items);
    }

    function sendTip(gorjeta) {
        localStorage.setItem('tip', JSON.stringify(gorjeta));
    }

    return (
        <div>
            {EditModal(show, setShow, currentItem, items, setItems)}
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

                            <td>{EditButton(item,setShow,setCurrentItem)}</td>
                                <td>{props.editable && <Button variant='danger' onClick={() => removeItem(item.item)}>Remove</Button>}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {props.editable && <div>
                Gorjeta:
                <NumberPicker defaultValue={tip} onChange={(gorjeta) => sendTip(gorjeta)} />
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

function EditButton(thisItem, setShow, setCurrentItem) {
    const handleShow = () => {
        setShow(true);
        setCurrentItem(thisItem);
        console.log(thisItem)
    }
    return (
        <Button variant="primary" onClick={handleShow}>
                Edit
        </Button>
    )
}

function EditModal(show, setShow, currentItem, items, setItems) {
    function setQuantity(quantity) {
        let new_items = items.map((item) => {
            if (item.item === currentItem.item) {
                item.quantity = quantity;
                console.log(item)
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
        setItems(new_items);
    }
    
    function setPrice(price) {
        let new_items = items.map((item) => {
            if (item.item === currentItem.item) {
                item.price = price;
                console.log(item)
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
        setItems(new_items);
    }
    
    const handleClose = () => setShow(false);
    

    const currentItemName = currentItem ? currentItem.item : '';
    const currentItemPrice = currentItem ? currentItem.price : '';
    const currentItemQuantity = currentItem ? currentItem.quantity : '';

    return (
        <>
            

            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Editar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <td>Item: {currentItemName}</td>
                <td>Quantidade: <NumberPicker defaultValue={currentItemQuantity} onChange={(currentItemQuantity) => setQuantity(currentItemQuantity)} /></td>
                <td>Preço:<NumberPicker defaultValue={currentItemPrice} onChange={(currentItemPrice) => setPrice(currentItemPrice)} /></td>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
