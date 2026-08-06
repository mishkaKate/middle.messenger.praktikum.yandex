import Handlebars from "handlebars";
import chatItemTpl from "./components/chat-list/__item/chat-list__item.hbs?raw";
import chatListTpl from "./components/chat-list/chat-list.hbs?raw";
import searchInputTpl from "./components/search-input/search-input.hbs?raw";
import avatarTmpl from "./components/avatar/avatar.hbs?raw";
import iconTpl from "./components/icon/icon.hbs?raw";
import chatContentTpl from "./components/chat-content/chat-content.hbs?raw"
import buttonTpl from "./components/button/button.hbs?raw";
import inputTpl from "./components/input/input.hbs?raw"
import { chats } from "./mocks/chats.ts";

import loginPageTpl from "./pages/enter/enter.hbs?raw";
import mainPageTpl from "./pages/main/main-page.hbs?raw";
import registrationPageTpl from "./pages/registration/registration-page.hbs?raw";
import profilePageTpl from "./pages/profile/profile-page.hbs?raw";
import profileChangePageTpl from "./pages/change-profile/change-profile-page.hbs?raw";
import passwordChangePageTpl from "./pages/change-password/change-password-page.hbs?raw";
import notFoundPageTpl from "./pages/notfound/notfound-page.hbs?raw";
import errorPageTpl from "./pages/error/error-page.hbs?raw";

Handlebars.registerPartial("chat-list", chatListTpl)
Handlebars.registerPartial("chat-item", chatItemTpl);
Handlebars.registerPartial("search-input", searchInputTpl)
Handlebars.registerPartial("avatar", avatarTmpl);
Handlebars.registerPartial("icon", iconTpl);
Handlebars.registerPartial("chat-content", chatContentTpl);
Handlebars.registerPartial("button", buttonTpl);
Handlebars.registerPartial("input", inputTpl);

const pathName = window.location.pathname;

switch(pathName) {
    case '/':
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(loginPageTpl)({});
        break;
    case '/main': 
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(mainPageTpl)({chats});
        break;
    case '/registration': 
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(registrationPageTpl)({});
        break;
    case '/profile':
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(profilePageTpl )({title: "Вадим", name: "Vadim", surname: "Petrov", phone: "+9647", email: "123@fgy.yu"});
        break;
    case '/profile-change':
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(profileChangePageTpl)({title: "Вадим", name: "Vadim", surname: "Petrov", phone: "+9647", email: "123@fgy.yu"});
        break;
    case '/password-change':
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(passwordChangePageTpl)({title: "Вадим", name: "Vadim", surname: "Petrov", phone: "+9647", email: "123@fgy.yu"});
        break;
    case '/500':
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(errorPageTpl)({});
        break;
    default: 
       document.querySelector<HTMLDivElement>('#app')!.innerHTML = Handlebars.compile(notFoundPageTpl)({});
}
