import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

export default function PeopleList() {
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');

  function sendClients(names) {
    axios.post('http://192.168.2.110:5000/api/v1/clients', names)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getClients() {
    axios.get('http://192.168.2.110:5000/api/v1/clients')
      .then((response) => {
        setNames(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
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