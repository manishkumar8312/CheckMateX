import { v4 as uuidv4 } from 'uuid';

export const generateRoomId = () => {
  return uuidv4().substring(0, 7).toUpperCase();
};

export const generatePlayerId = () => {
  return uuidv4();
};
