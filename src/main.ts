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
import { InputImage } from './components/input/input-image.ts';
import { ChatContentSendForm } from './components/chat-content/chat-content__send-form/chat-content__send-form.ts';
import { Link } from './components/link/link.ts';

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

Handlebars.registerPartial('icon', iconTpl);

const pathName = window.location.pathname;

let mainPage;
let registartionPage;
let profilePage;
let loginPage;
let changePasswordPage;
let changeProfilePage;
let notFoundPage;
let errorPage;

let mainPageElement;
let registartionElement;
let profileElement;
let loginElement;
let changePasswordElement;
let changeProfileElement;
let notFoundElement;
let errorElement;

switch (pathName) {
  case '/':
    document.querySelector<HTMLDivElement>('#app')!.innerHTML =
      Handlebars.compile(startPageTpl)({});
    break;
  case '/login':
    if (!loginPage) {
      loginPage = new LoginPage();
      loginElement = loginPage.element();
    }

    if (loginElement) {
      document.body.appendChild(loginElement);
    }

    break;
  case '/main':
    if (!mainPage) {
      mainPage = new MainPage({ chats });
      mainPageElement = mainPage.element();
    }

    if (mainPageElement) {
      document.body.appendChild(mainPageElement);
    }

    break;
  case '/registration':
    if (!registartionPage) {
      registartionPage = new RegistrationPage();
      registartionElement = registartionPage.element();
    }

    if (registartionElement) {
      document.body.appendChild(registartionElement);
    }

    break;
  case '/profile':
    if (!profilePage) {
      profilePage = new ProfilePage({ name: 'Фёдор', surname: 'Конюхов', phone: '+123456789', email: 'konfed@er.fg', avatar: 'https://avatars.mds.yandex.net/i?id=f58facbd6a7c5069025bae76110e191fa600422c-5233451-images-thumbs&n=13' });
      profileElement = profilePage.element();
    }

    if (profileElement) {
      document.body.appendChild(profileElement);
    }

    break;
  case '/profile-change':
    if (!changeProfilePage) {
      changeProfilePage = new ChangeProfilePage();
      changeProfileElement = changeProfilePage.element();
    }

    if (changeProfileElement) {
      document.body.appendChild(changeProfileElement);
    }

    break;
  case '/password-change':
    if (!changePasswordPage) {
      changePasswordPage = new ChangePasswordPage();
      changePasswordElement = changePasswordPage.element();
    }

    if (changePasswordElement) {
      document.body.appendChild(changePasswordElement);
    }

    break;
  case '/500':
    if (!errorPage) {
      errorPage = new ErrorPage({ messege: 'Что-то пошло не так' });
      errorElement = errorPage.element();
    }
    if (errorElement) {
      document.body.appendChild(errorElement);
    }
    break;
  case '/404':
    if (!notFoundPage) {
      notFoundPage = new ErrorPage({
        messege: '404 Извините, такой страницы нет',
      });
      notFoundElement = notFoundPage.element();
    }

    if (notFoundElement) {
      document.body.appendChild(notFoundElement);

    }
    break;
  default:
    if (!errorPage) {
      errorPage = new ErrorPage({ messege: 'Что-то пошло не так' });
      errorElement = errorPage.element();
    }
    if (errorElement) {
      document.body.appendChild(errorElement);
    }
    break;
}

