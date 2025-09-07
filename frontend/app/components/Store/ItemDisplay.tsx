import type { User } from '~/models/User';
import type { Item } from '~/models/Item';

import UserInfo from '~/components/shared/UserInfo';
import classnames from 'classnames';

import "./ItemDisplay.css";

const ItemDisplay: React.FC<{
  item: Item,
  user?: User,
  buyItem?: (item: Item) => void,
  purchaseDate?: string,
}> = ({item, user, buyItem, purchaseDate}) => {
  if (!item) return null;

  const countRemaining = item.quantity ? item.quantity - item.count : null;
  const getItemQuantityString = () => {
    if (!item.quantity) return "Unlimited";
    else if (item.count === 0) return `${item.quantity} left`;
    else return `${countRemaining} / ${item.quantity} left`;
  }
  const quantityString = getItemQuantityString();

  return (
    <li
      key={item.id}
      className={classnames(
        "item p-2",
        buyItem && countRemaining === 1 ? 'limited' : '',
        buyItem && !item.is_available ? 'sold-out' : '',
    )}
    >
      <div className="flex gap-4">
        <img src="https://placehold.co/100x100/EEE/31343C" />
        <div>
          <h3 className="my-2">{item.name}</h3>
          <p>{item.description}</p>
          {(user && !buyItem) && (
            <div className="grid my-2">
              <span className='item__field'>Purchased By</span>
              <UserInfo user={user} />

              { purchaseDate && (
                <>
                <span className='item__field'>Time</span>
                <span>{new Date(purchaseDate).toLocaleString()}</span>
                </>
              )}
            </div>
          )}
          { buyItem && (
            <div className="grid my-2">
              <span className='item__field'>Cost</span>
              <span className={classnames(user?.balance !== undefined && item.cost > user.balance ? 'error' : '')}>
                {item.cost} gems
              </span>
              <span className='item__field'>Limit</span>
              <span>{quantityString}</span>
            </div>
          )}
        </div>
      </div>

      {buyItem && (<button className="button mt-2" onClick={() => buyItem(item)} disabled={!item.is_available}>Exchange</button>)}
    </li>
  );
}

export default ItemDisplay;
