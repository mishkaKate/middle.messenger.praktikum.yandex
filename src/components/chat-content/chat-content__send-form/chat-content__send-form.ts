import { sendMessege } from '../../../services/chats';
import { Form } from '../../form/form';
import tpl from './chat-content__send-form.hbs?raw';

export type Messege = {
  messege: string;
};

export class ChatContentSendForm extends Form<Messege> {
  protected template = tpl;
  static componentName = 'ChatContentSendForm';

  onSubmit = (res: Messege) => {
    sendMessege(res.messege);
  };
}
