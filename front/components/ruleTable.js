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
        axios.get('http://192.168.2.110:5000/api/v1/resume')
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
        axios.post('http://192.168.2.110:5000/api/v1/rules', rules)
            .then((response) => {
                console.log("OK RULES");
                getResult();
            }, (error) => {
                console.log(error);
            });
    }
    function getRules() {
        axios.get('http://192.168.2.110:5000/api/v1/rules')
            .then((response) => {
                setRules(response.data);
                getResult();
            }
            )
            .catch((error) => {
                console.log(error);
            }
            );
    }


    function getClients() {
        axios.get('http://192.168.2.110:5000/api/v1/clients')

            .then((response) => {
                setNames(response.data);
                setSelectedPerson(response.data[0]);

            }
            )
            .catch((error) => {
                console.log(error);
            }
            );
    }


    function getItems() {
        axios.get('http://192.168.2.110:5000/api/v1/items')
            .then((response) => {
                setItems(response.data);
                setSelecteditem(response.data[0].item);
                setMaxQuantity(response.data[0].quantity)
                setSelectedQuantity(0)
            })
            .catch((error) => {
                console.log(error);
            }
            );
    }


    function getModes() {
        axios.get('http://192.168.2.110:5000/api/v1/modes')

            .then((response) => {
                setModes(response.data);
                setSelectedMode(response.data[0]);
            }
            )
            .catch((error) => {
                console.log(error);
            }
            );
    }

    useEffect(() => {
        getRules();
        getClients();
        getItems();
        getModes();
        getResult();

    }, []);

    

    function addRule() {
        const rule_key = rules.length
        const new_rule = { key: rule_key, name: selectedPerson, item: selecteditem, mode: selectedMode, quantity: selectedQuantity }
        console.log(new_rule)
        // const new_rule = { name: selectedPerson, item: selecteditem, mode: selectedMode, quantity: selectedQuantity }
        sendRules([...rules, new_rule])
        setRules([...rules, new_rule])
        
    }

    function removeRule(key) {
        const new_rules = rules.filter((rule) => rule.key !== key)
        sendRules(new_rules)
        setRules(new_rules)        
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
                            <td><Button variant="danger"  onClick={() => removeRule(rule.key)}>Remove</Button></td>
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
                    <span>R$ {somaDaConta ? somaDaConta.toFixed(2): "-" }</span>
                </div>
                <div>
                    <span>Soma do que todos vão pagar: </span>
                    <span>R$ {somaDivisao ? somaDivisao.toFixed(2): "-" }</span>
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
