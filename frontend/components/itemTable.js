import { useState, useEffect } from 'react';
import axios from 'axios';
import NumberPicker from "react-widgets/NumberPicker";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';

export default function ItemTable(props) {
    const [items, setItems] = useState([]);
    const [result, setResult] = useState();
    const [tip, setTip] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [show, setShow] = useState(false);

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
        getTip();
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

  

    function sendTip(gorjeta) {
        setTip(gorjeta);
        localStorage.setItem('tip', JSON.stringify(gorjeta));
    }

    function getTip() {
        const tip = JSON.parse(localStorage.getItem('tip'));
        if (tip) {
            return tip;
        }
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

                            <td>{EditModal(show,setShow,item.item,item.price,item.quantity,items,setItems)}
                                {props.editable && <Button variant='danger' onClick={() => removeItem(item.item, item.price, item.quantity)}>Remove</Button>}</td>
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

function EditModal(show, setShow, itemName, price, quantity,items,setItems) {
    function setQuantity(quantity) {
        console.log(itemName)
        let new_items = items.map((item) => {
            if (item.item === itemName) {
                item.quantity = quantity;
                console.log(item)
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
        setItems(new_items);
    }
    
    function setPrice(price) {
        console.log(itemName)
        let new_items = items.map((item) => {
            if (item.item === itemName) {
                item.price = price;
                console.log(item)
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
        setItems(new_items);
    }
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    function handleChangeitem(e) {
        setitem(e.target.value);
    }

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Edit
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <td><input type="text" value={itemName} onChange={handleChangeitem} className="form-control" /></td>
                <td><NumberPicker defaultValue={quantity} onChange={(quantity) => setQuantity(quantity)} /></td>
                <td><NumberPicker defaultValue={price} onChange={(price) => setPrice(price)} /></td>


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
