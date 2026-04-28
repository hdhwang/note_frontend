import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

let message: MessageInstance;
let notification: NotificationInstance;
let modal: ReturnType<typeof App.useApp>['modal'];

export default () => {
  const staticFunctions = App.useApp();
  message = staticFunctions.message;
  notification = staticFunctions.notification;
  modal = staticFunctions.modal;
  return null;
};

export { message, notification, modal };
