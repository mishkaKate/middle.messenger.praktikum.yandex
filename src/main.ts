import Handlebars from 'handlebars';
import iconTpl from './components/icon/icon.hbs?raw';
import { registerComponent } from './utils/helpers.ts';
import { Avatar } from './components/avatar/avatar.ts';
import { Button } from './components/button/button.ts';
import { RegistrationPage } from './pages/registration/registartion-page.ts';
import { Input } from './components/input/input.ts';
import { MainPage } from './pages/main/main-page.ts';
import { ProfilePage } from './pages/profile/profile-page.ts';
import { LoginPage } from './pages/login/login.ts';
import { ChangePasswordPage } from './pages/change-password/change-password-page.ts';
import { ChangeProfilePage } from './pages/change-profile/change-profile.ts';
import { ErrorPage } from './pages/error/error-page.ts';
import { ChatContent } from './components/chat-content/chat-content.ts';
import { ChatList } from './components/chat-list/chat-list.ts';
import { SearchInput } from './components/search-input/search-input.ts';
import { ChatListItem } from './components/chat-list/__item/chat-list__item.ts';
import { ChatContentMessege } from './components/chat-content/chat-content__messege/chat-content__messege.ts';
import { Form } from './components/form/form.ts';
import { Error } from './components/error/error.ts';
import { Icon } from './components/icon/icon.ts';
import { InputImage } from './components/input/input-image.ts';
import { ChatContentSendForm } from './components/chat-content/chat-content__send-form/chat-content__send-form.ts';
import { Link } from './components/link/link.ts';
import router from './router/router.ts';
import { Popup } from './components/popup/popup.ts';
import { Modal } from './components/modal/modal.ts';

registerComponent(Error);
registerComponent(Icon);
registerComponent(Avatar);
registerComponent(Link);
registerComponent(Button);
registerComponent(Input);
registerComponent(InputImage);
registerComponent(SearchInput);
registerComponent(ChatContentSendForm);
registerComponent(ChatContent);
registerComponent(ChatList);
registerComponent(ChatListItem);
registerComponent(ChatContentMessege);
registerComponent(Form);
registerComponent(Popup);
registerComponent(Modal);

Handlebars.registerPartial('icon', iconTpl);

router
  .use('/', LoginPage)
  .use('/sign-up', RegistrationPage)
  .use('/settings', ProfilePage)
  .use('/profile-change', ChangeProfilePage)
  .use('/password-change', ChangePasswordPage)
  .use('/messenger', MainPage)
  .use('/404', ErrorPage)
  .use('/500', ErrorPage)
  .start();
