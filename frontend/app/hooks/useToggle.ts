import { useState } from 'react';

const useToggle = (defaultValue = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(defaultValue);
  const toggle = () => setValue((currentState) => !currentState);
  return [value, toggle, setValue];
};

export default useToggle;
