import { useState } from 'react';
import ItemTable from '../components/itemTable';
import FinalTable from '../components/finalTable';
import PeopleList from '../components/peopleList';
import styles from '../components/layout.module.css';
import "react-widgets/styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';



// import './styles/global.css'

function Header(props) {
  return <h1>{props.title}</h1>;
}



export default function HomePage() {
  
  
  const [modes, setModes] = useState(['Normal', 'Light', 'Zero']);
  const [rulesTable, setRulesTable] = useState([])
  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };


  return (
    <div>
     
      
      <Header title="Divisão Conta!!" />
      
      
      
      <div>
      <div className={styles.buttoncontainer}>
        <Button onClick={() => handleTabClick(1)}>Itens da Conta</Button>
        <Button onClick={() => handleTabClick(2)}>Pessoas Na Mesa</Button>
        {/* <Button onClick={() => handleTabClick(3)}>Divisão da Conta</Button> */}
      </div>
      {activeTab === 1 && <div className={styles.container}><ItemTable editable={true}/></div>}
      {activeTab === 2 && <div className={styles.container}><PeopleList/></div>}
      {activeTab === 3 && <div className={styles.container}><FinalTable/></div>}
     
    </div>

    {/* <div className="split-screen">
      <div className={styles.container}><PeopleList/></div>
      <div className={styles.container}><FillTable/></div>
      <div className={styles.container}><RuleTable/></div>}
    </div> */}

    </div>
  );
}
