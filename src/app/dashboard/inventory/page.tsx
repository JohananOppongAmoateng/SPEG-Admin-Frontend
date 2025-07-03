import Header from '../../(components)/Header';
import CollapsibleProductTable from '../../(components)/CollapsibleProductTable';

const Inventory = () => {
  return (
    <div className="flex flex-col">
      <Header name="Inventory" />

      <div className="mt-5">
        <CollapsibleProductTable />
      </div>
    </div>
  );
};

export default Inventory;
