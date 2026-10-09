import { mountApp } from './app/shell';
import './styles/global.css';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('Missing #app root');
}

mountApp(root);
