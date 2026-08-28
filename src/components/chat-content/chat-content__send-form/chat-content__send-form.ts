import { sendMessege, type Messege } from '../../../models/messege-model';
import { Form } from '../../form/form';
import tpl from './chat-content__send-form.hbs?raw';

export class ChatContentSendForm extends Form<Messege> {
    protected template = tpl;
    static componentName = 'ChatContentSendForm';

    onSubmit = (res: Messege) => {
        sendMessege(res);
    };
}
