import { HubConnectionBuilder } from '@microsoft/signalr';
import { store } from '../redux/store';
import { url } from '../config/config';
let connection = null;

export const startSignalRConnection = (onReceive) => {

  const currentUser = store.getState().auth.login.currentUser;
  const token = currentUser?.data?.token;

  connection = new HubConnectionBuilder()
    .withUrl(url+ '/hubs/notification', {
        withCredentials: true,
      accessTokenFactory: () => token // nếu cần token
    })
    .withAutomaticReconnect()
    .build();

  connection.start()
    .then(() => console.log('SignalR connected'))
    .catch(err => console.error('SignalR error:', err));

  connection.on('ReceiveNotification', onReceive);
};

export const stopSignalRConnection = () => {
  if (connection) {
    connection.stop();
  }
};
