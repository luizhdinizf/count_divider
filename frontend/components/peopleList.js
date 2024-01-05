import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import styles from '../components/layout.module.css';
import Avatar from 'react-avatar';

export default function PeopleList() {
  const [names, setNames] = useState([]);
  const [currentName, setCurrentName] = useState('');
  const [rules, setRules] = useState([])

  function sendRules(rules) {
    localStorage.setItem('rules', JSON.stringify(rules));
  }

  function getRules() {
    const rules = JSON.parse(localStorage.getItem('rules'));
    if (rules) {
      setRules(rules);
    }
  }

  function sendClients(names) {
    localStorage.setItem('clients', JSON.stringify(names));
  }

  function getClients() {
    const clients = JSON.parse(localStorage.getItem('clients'));
    if (clients) {
      setNames(clients);
    }
  }

  useEffect(() => {
    getClients();
    getRules()
  }, []);


  function removeName(name) {
    const new_names = names.filter((item) => item !== name);
    const new_rules = rules.filter((rule) => rule.name !== name);
    sendClients(new_names);
    sendRules(new_rules);
    setNames(new_names);
    setRules(new_rules);
  }

  function addName(name) {
    setNames([...names, name]);
    setCurrentName('');
    sendClients([...names, name]);
  }



  return (
    <div>
      {nameAdder(currentName, setCurrentName, addName)}
      {PeopleCardList(names, removeName, rules, setRules)}
    </div>
  );
}

function nameAdder(currentName, handleChange, addName) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input type="text" value={currentName} onChange={(e) => handleChange(e.target.value)} className="form-control" />
      <Button onClick={() => addName(currentName)}>Add</Button>
    </div>
  );
}

function PeopleCardList(names, removeName, rules, setRules) {
  return (
    <div className={styles.peopleCardList}>
      {names.map((name) => (
        PeopleCard(name, removeName, rules, setRules)
      ))}
    </div>
  );
}



function PeopleCard(name, clicked, rules, setRules) {


  const items = localStorage.getItem('items');
  const itemsList = items ? JSON.parse(items) : [];

  return (
    <Card >
      <Card.Body>
        <Card.Text>
        <Card.Title><Avatar name={name} /> {name}</Card.Title>
      
          <Form className={styles.itemlist}>
            {itemsList.map((item) => (
              itemCheckbox(name, item, rules, setRules)

            ))}
          </Form>
        </Card.Text>
        <Button variant='danger' onClick={() => clicked(name)}>Remover</Button>
      </Card.Body>
    </Card>
  );
}


function itemCheckbox(name, item, rules, setRules) {
  const checked = rules.filter((rule) => rule.name === name && rule.item === item.item).length > 0
  console.log(rules);
  function changeRule(checked, selectedPerson, selecteditem, selectedMode, selectedQuantity,setRules) {
    const rules = localStorage.getItem('rules');
    const parsed_rules = rules ? JSON.parse(rules) : []
    if (checked) {
      const rule_key = parsed_rules.length;
      const new_rule = { key: rule_key, name: selectedPerson, item: selecteditem, mode: selectedMode, quantity: selectedQuantity };
      localStorage.setItem('rules', JSON.stringify([...parsed_rules, new_rule]));
      setRules([...parsed_rules, new_rule]);

    } else {
      const rule_to_remove = parsed_rules.filter((rule) => rule.name === selectedPerson && rule.item === selecteditem)[0]
      if (!rule_to_remove) {
        return
      }
      const new_rules = parsed_rules.filter((rule) => rule.key !== rule_to_remove.key);
      const reordered_rules = new_rules.map((rule, index) => ({ ...rule, key: index }));
      setRules(reordered_rules);
      localStorage.setItem('rules', JSON.stringify(reordered_rules));
    }
    
    

  }

  return (
    <div className={styles.itemCheckbox}>

    <Form.Check
      type="checkbox"      
      checked={checked}
      key={name + item.item}
      onChange={(e) => { changeRule(e.target.checked, name, item.item, "consumed", item.quantity,setRules);}}
      />
    {item.item}
    </div>
  )
}