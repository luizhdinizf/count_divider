import RuleTable from '../components/ruleTable';
import ItemTable from './itemTable';
import styles from '../components/layout.module.css';
export default function FinalTable() {



    return (
        <div className="split-screen">
            <div className={styles.fullwidth}><RuleTable /></div>
            <div className={styles.fullwidth}><ItemTable editable={false} /></div>
        </div>
    );
}
