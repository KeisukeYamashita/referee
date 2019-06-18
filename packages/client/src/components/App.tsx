import * as React from 'react';
import * as H from 'history';
import { Provider } from 'mobx-react';
import { BrowserRouter, Route } from 'react-router-dom';

import { stores } from '../stores';

import Header from './Header';
import Footer from './Footer';
import Landing from './Landing';
import ModalViewer from './ModalViewer';
import ConfigEditor from './config/ConfigEditor';
import CanaryExecutor from './canary-executor/CanaryExecutor';
import Docs from './docs/Docs';

import './App.scss';
import 'typeface-assistant/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import CanaryExecutorResults from './results/CanaryExecutorResults';

interface AppProps {}

export default class App extends React.Component<AppProps> {
  render(): React.ReactNode {
    return (
      <BrowserRouter basename="/dashboard">
        <Provider {...stores}>
          <div id="kayenta-config-manager">
            <ModalViewer />
            <Route render={({ history }: { history: H.History }) => <Header history={history} />} />
            <div className="content-container">
              <div className="content-container-inner-wrapper">
                <Route exact={true} path="/" component={Landing} />
                <Route path="/docs/:path(.*)" component={Docs} />
                <Route path="/config/edit/local" component={ConfigEditor} />
                <Route path="/dev-tools/canary-executor" component={CanaryExecutor} />
                <Route path="/dev-tools/results" component={CanaryExecutorResults} />
              </div>
            </div>
            <Footer />
          </div>
        </Provider>
      </BrowserRouter>
    );
  }
}
