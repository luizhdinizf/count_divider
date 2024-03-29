import { useState, useEffect } from 'react';
import axios from 'axios';
import NumberPicker from "react-widgets/NumberPicker";
import DropdownList from "react-widgets/DropdownList";
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';




export default function RuleTable() {
    const [result, setResult] = useState();
    const [dividedBill, setDividedBill] = useState();
    const [somaDaConta, setSomaDaConta] = useState();
    const [somaDivisao, setSomaDivisao] = useState();
    const [message, setMessage] = useState();
    const [names, setNames] = useState([]);
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [modes, setModes] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(names[0])
    const [selecteditem, setSelecteditem] = useState(items[0])
    const [selectedMode, setSelectedMode] = useState(modes[0])
    const [selectedQuantity, setSelectedQuantity] = useState(items[0])
    const [maxQuantity, setMaxQuantity] = useState(10)

    function getResult() {
        getClients();
        getItems();
        const parsed_rules = getRules();
        console.log(parsed_rules)
        const url = 'https://fpx2ytu0se.execute-api.us-east-2.amazonaws.com/Teste/resume'
        const request_body = {
            "rules": parsed_rules,
            "clients": names,
            "bill": items,
            "gorjeta": { "tip": 1.1 }
        }
        axios.post(url,
            request_body
            
        )
            .then((response) => {
                console.log(response.data.divided_bill);
                setResult(response.data);
                setDividedBill(response.data.divided_bill);
                setSomaDaConta(response.data.real_total);
                setSomaDivisao(response.data.divided_total);
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const isSomaDivisaoEqualSomaDaConta = somaDivisao === somaDaConta;

    const messageLines = message ? message.split('\n') : [];

    function sendRules(rules) {
        localStorage.setItem('rules', JSON.stringify(rules));        
    }
    function getRules() {
        const rules = localStorage.getItem('rules');
        const parsed_rules = rules ? JSON.parse(rules) : []
        setRules(parsed_rules);
        return parsed_rules

    }


    function getClients() {
        const names = localStorage.getItem('clients');
        setNames(names ? JSON.parse(names) : []);
        setSelectedPerson(names ? JSON.parse(names)[0] : {});       
    }


    function getItems() {
        const items = localStorage.getItem('items');
        setItems(items ? JSON.parse(items) : []);
        setSelecteditem(items ? JSON.parse(items)[0].item : {});
        setMaxQuantity(items ? Math.floor(JSON.parse(items)[0].quantity) : {});
        setSelectedQuantity(0)
    }


    function getModes() {
        setModes(["consumed", "arrived_after", "leaved_on", "consumed_solo"]);
        setSelectedMode("consumed");        
    }

    useEffect(() => {
        getRules();
        getClients();
        getItems();
        getModes();
        getResult();
    }, []);



    function addRule() {
        const rule_key = rules.length;
        const new_rule = { key: rule_key, name: selectedPerson, item: selecteditem, mode: selectedMode, quantity: selectedQuantity };
        console.log(new_rule);
        // const new_rule = { name: selectedPerson, item: selecteditem, mode: selectedMode, quantity: selectedQuantity }
        setRules([...rules, new_rule]);
        sendRules([...rules, new_rule]);
        getResult();


    }

    function removeRule(key) {
        const new_rules = rules.filter((rule) => rule.key !== key);
        setRules(new_rules);
        sendRules(new_rules);
        getResult();
    }
    function setCurrentItemAndQuantity(currentitem) {
        setSelecteditem(currentitem)
        const currentItem = items.find(item => item.item === currentitem)
        const integer = Math.floor(currentItem.quantity)
        setMaxQuantity(integer)
    }

    return (
        <div>

            <Table striped hover>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Item</th>
                        <th>Modo</th>
                        <th>Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {/* <td><DropdownList
                        data={names}                        
                        onChange={(name) => setSelectedPerson(name)}
                    /></td> */}
                        <td><ListPicker items={names} onClick={(name) => setSelectedPerson(name)} /></td>
                        <td><ListPicker items={items.map(item => item.item)} onClick={(item) => setCurrentItemAndQuantity(item)} /></td>
                        <td><ListPicker items={modes} onClick={(mode) => setSelectedMode(mode)} /></td>
                        {selectedMode !== 'consumed' && <td><NumberPicker max={maxQuantity} onChange={(quantity) => setSelectedQuantity(quantity)} /></td>}
                        {selectedMode === 'consumed' && <td>-</td>}
                        <td><Button onClick={addRule}>Add</Button></td>
                    </tr>
                    {rules.map((rule) => (
                        <tr>
                            <td>{rule.name}</td>
                            <td>{rule.item}</td>
                            <td>{rule.mode}</td>
                            <td>{rule.mode === "consumed" ? '-' : rule.quantity}</td>
                            <td><Button variant="danger" onClick={() => removeRule(rule.key)}>Remove</Button></td>
                        </tr>

                    ))}

                </tbody>
            </Table>
            <hr></hr>
            <div>

                {dividedBill && Object.entries(dividedBill).map(([key, value]) => (
                    <div key={key}>
                        <span>{key} vai pagar </span>
                        <span>R$ {value.toFixed(2)}</span>
                    </div>
                ))}
                <div>
                    <span>Soma da conta: </span>
                    <span>R$ {somaDaConta ? somaDaConta.toFixed(2) : "-"}</span>
                </div>
                <div>
                    <span>Soma do que todos vão pagar: </span>
                    <span>R$ {somaDivisao ? somaDivisao.toFixed(2) : "-"}</span>
                </div>
                <div>
                    <span>Resultado: </span>
                    <Alert style={{ color: isSomaDivisaoEqualSomaDaConta ? 'green' : 'red' }} variant={isSomaDivisaoEqualSomaDaConta ? 'success' : 'danger'}>{isSomaDivisaoEqualSomaDaConta ? 'OK' : 'ERRO'}</Alert>
                </div>
                {messageLines.map((line, index) => (
                    line && <Alert key={index} variant={isSomaDivisaoEqualSomaDaConta ? 'success' : 'danger'}>{line}</Alert>
                ))}
            </div>
        </div>
    )

}



function ListPicker({ items, onClick }) {
    const [selectedItem, setSelectedItem] = useState(); // Set the first item as the default

    function handleChange(e) {
        console.log(e)
        const newValue = e;
        setSelectedItem(newValue);
        onClick(newValue);
    }

    return (
        <DropdownList
            data={items}
            value={selectedItem}
            onChange={handleChange}
        />
    );


function ResultShower(){
    const [dividedBill, setDividedBill] = useState();
    const [somaDaConta, setSomaDaConta] = useState();
    const [somaDivisao, setSomaDivisao] = useState();
    const [message, setMessage] = useState();
    const [result, setResult] = useState();
    const isSomaDivisaoEqualSomaDaConta = somaDivisao === somaDaConta;
    const messageLines = message ? message.split('\n') : [];

    function getResult() {
        const names = localStorage.getItem('clients');
        const parsed_names = names ? JSON.parse(names) : []
        const items = localStorage.getItem('items');
        const parsed_items = items ? JSON.parse(items) : [];
        const rules = localStorage.getItem('rules');
        const parsed_rules = rules ? JSON.parse(rules) : []
        
        
        console.log(parsed_rules)
        const url = 'https://fpx2ytu0se.execute-api.us-east-2.amazonaws.com/Teste/resume'
        const request_body = {
            "rules": parsed_rules,
            "clients": parsed_names,
            "bill": parsed_items,
            "gorjeta": { "tip": 1.1 }
        }
        axios.post(url,
            request_body
            
        )
            .then((response) => {
                console.log(response.data.divided_bill);
                setResult(response.data);
                setDividedBill(response.data.divided_bill);
                setSomaDaConta(response.data.real_total);
                setSomaDivisao(response.data.divided_total);
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    useEffect(() => {
        getResult();
    }, []);
    return(
        <div>

                {dividedBill && Object.entries(dividedBill).map(([key, value]) => (
                    <div key={key}>
                        <span>{key} vai pagar </span>
                        <span>R$ {value.toFixed(2)}</span>
                    </div>
                ))}
                <div>
                    <span>Soma da conta: </span>
                    <span>R$ {somaDaConta ? somaDaConta.toFixed(2) : "-"}</span>
                </div>
                <div>
                    <span>Soma do que todos vão pagar: </span>
                    <span>R$ {somaDivisao ? somaDivisao.toFixed(2) : "-"}</span>
                </div>
                <div>
                    <span>Resultado: </span>
                    <Alert style={{ color: isSomaDivisaoEqualSomaDaConta ? 'green' : 'red' }} variant={isSomaDivisaoEqualSomaDaConta ? 'success' : 'danger'}>{isSomaDivisaoEqualSomaDaConta ? 'OK' : 'ERRO'}</Alert>
                </div>
                {messageLines.map((line, index) => (
                    line && <Alert key={index} variant={isSomaDivisaoEqualSomaDaConta ? 'success' : 'danger'}>{line}</Alert>
                ))}
            </div>
    )
}

    // return (
    //     <select value={selectedItem} onChange={handleChange}>
    //         {items.map((item) => (
    //             <option key={item} value={item}>
    //                 {item}
    //             </option>
    //         ))}
    //     </select>
    // );
}
