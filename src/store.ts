import { merge, set } from './utils/helpers';

type Listener = () => void;

export type ProfileState = {
  id: number;
  first_name: string;
  second_name: string;
  email: string;
  avatar: string;
  login: string;
  phone: string;
};

export type ChatItemState = {
  id: number;
};

export type State = {
  userProfile?: ProfileState;
  chats?: Array<ChatItemState>;
  activeChat?: number;
};

class Store {
  private state: State = {};
  private listeners: Set<Listener> = new Set();

  public getState() {
    return this.state;
  }

  public setState(path: string, value: unknown) {
    this.state = merge(this.state, set({}, path, value));

    this.emit();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export default new Store();
