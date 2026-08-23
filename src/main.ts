import Handlebars from 'handlebars';
import iconTpl from './components/icon/icon.hbs?raw';
import { chats } from './mocks/chats.ts';
import startPageTpl from './pages/start.hbs?raw';
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

registerComponent(Error);
registerComponent(Icon);
registerComponent(Avatar);
registerComponent(Button);
registerComponent(Input);
registerComponent(SearchInput);
registerComponent(ChatContent);
registerComponent(ChatList);
registerComponent(ChatListItem);
registerComponent(ChatContentMessege);
registerComponent(Form);

Handlebars.registerPartial('icon', iconTpl);

const pathName = window.location.pathname;

const mp = new MainPage({ chats });
const registartionPage = new RegistrationPage();
const profilePage = new ProfilePage();
const loginPage = new LoginPage();
const changePasswordPage = new ChangePasswordPage();
const chanheProfilePage = new ChangeProfilePage();
const notFoundPage = new ErrorPage({
  messege: '404 Извините, такой страницы нет',
});
const errorPage = new ErrorPage({ messege: 'Что-то пошло не так' });

const mpElement = mp.element();
const registartionElement = registartionPage.element();
const profileElement = profilePage.element();
const loginElement = loginPage.element();
const changePasswordElement = changePasswordPage.element();
const chanheProfileElement = chanheProfilePage.element();
const notFoundElement = notFoundPage.element();
const errorElement = errorPage.element();

if (
  !loginElement ||
  !mpElement ||
  !registartionElement ||
  !profileElement ||
  !changePasswordElement ||
  !chanheProfileElement ||
  !errorElement ||
  !notFoundElement
) {
  document.querySelector<HTMLDivElement>('#app')!.innerText = 'Error';
} else {
  switch (pathName) {
    case '/':
      document.querySelector<HTMLDivElement>('#app')!.innerHTML =
        Handlebars.compile(startPageTpl)({});
      break;
    case '/login':
      document.body.appendChild(loginElement);
      break;
    case '/main':
      document.body.appendChild(mpElement);
      break;
    case '/registration':
      document.body.appendChild(registartionElement);
      break;
    case '/profile':
      document.body.appendChild(profileElement);
      break;
    case '/profile-change':
      document.body.appendChild(chanheProfileElement);
      break;
    case '/password-change':
      document.body.appendChild(changePasswordElement);
      break;
    case '/500':
      document.body.appendChild(errorElement);
      break;
    case '/404':
      document.body.appendChild(notFoundElement);
      break;
    default:
      document.body.appendChild(notFoundElement);
  }
}
