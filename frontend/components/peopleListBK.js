import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

export default function PeopleList() {
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');

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
  }, []);


  function removeName(name) {
    const new_names = names.filter((item) => item !== name);
    setNames(new_names);
    sendClients(new_names);
  }

  function addName(name) {
    setNames([...names, name]);
    setName('');
    sendClients([...names, name]);
  }

  function handleChange(e) {
    setName(e.target.value);
  }

  return (
    <div>
      <Table striped hover >
        <thead>
          <tr>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={name}>
              <td>{name}</td>
              <td>
                <Button variant='danger' onClick={() => removeName(name)}>Remover</Button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input type="text" value={name} onChange={handleChange} className="form-control" />
            </td>
            <td>
              <Button onClick={() => addName(name)}>Add</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}