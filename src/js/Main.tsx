import { Helmet } from 'react-helmet';
import { createHashHistory } from 'history';
import iris from 'iris-lib';
import AsyncRoute from 'preact-async-route';
import { CustomHistory, Router, RouterOnChangeArgs } from 'preact-router';

import Footer from './components/Footer';
import MediaPlayer from './components/MediaPlayer';
import Menu from './components/Menu';
import VideoCall from './components/VideoCall';
import { translationLoaded } from './translations/Translation';
import About from './views/About';
import Chat from './views/chat/Chat';
import Contacts from './views/Contacts';
import Feed from './views/Feed';
import Follows from './views/Follows';
import Group from './views/Group';
import Hashtags from './views/Hashtags';
import Login from './views/Login';
import LogoutConfirmation from './views/LogoutConfirmation';
import Message from './views/Message';
import Notifications from './views/Notifications';
import Profile from './views/Profile';
import Settings from './views/settings/Settings';
import Torrent from './views/Torrent';
import Component from './BaseComponent';
import Helpers from './Helpers';
import QRScanner from './QRScanner';

import '../css/style.css';
import '../css/cropper.min.css';

if (window.location.host === 'iris.to' && window.location.pathname !== '/') {
  window.location.href = window.location.href.replace(window.location.pathname, '/');
}

type Props = Record<string, unknown>;

type ReactState = {
  loggedIn: boolean;
  showMenu: boolean;
  unseenMsgsTotal: number;
  activeRoute: string;
  platform: string;
  translationLoaded: boolean;
};

iris.session.init({ autologin: window.location.hash.length > 2 });

class Main extends Component<Props, ReactState> {
  componentDidMount() {
    iris.local().get('loggedIn').on(this.inject());
    iris.local().get('toggleMenu').put(false);
    iris
      .local()
      .get('toggleMenu')
      .on((show: boolean) => this.toggleMenu(show));
    iris.electron && iris.electron.get('platform').on(this.inject());
    iris.local().get('unseenMsgsTotal').on(this.inject());
    translationLoaded.then(() => this.setState({ translationLoaded: true }));
  }

  handleRoute(e: RouterOnChangeArgs) {
    const activeRoute = e.url;
    this.setState({ activeRoute });
    iris.local().get('activeRoute').put(activeRoute);
    QRScanner.cleanupScanner();
  }

  onClickOverlay(): void {
    if (this.state.showMenu) {
      this.setState({ showMenu: false });
    }
  }

  toggleMenu(show: boolean): void {
    this.setState({
      showMenu: typeof show === 'undefined' ? !this.state.showMenu : show,
    });
  }

  electronCmd(name: string): void {
    iris.electron.get('cmd').put({ name, time: new Date().toISOString() });
  }

  render() {
    let title = '';
    const s = this.state;
    if (s.activeRoute && s.activeRoute.length > 1) {
      title = Helpers.capitalize(s.activeRoute.replace('/', ''));
    }
    const isDesktopNonMac = s.platform && s.platform !== 'darwin';
    const titleTemplate = s.unseenMsgsTotal ? `(${s.unseenMsgsTotal}) %s | iris` : '%s | iris';
    const defaultTitle = s.unseenMsgsTotal ? `(${s.unseenMsgsTotal}) iris` : 'iris';
    if (!s.translationLoaded) {
      return <div id="main-content" />;
    }
    if (!s.loggedIn && window.location.pathname.length > 2) {
      return <div id="main-content" />;
    }
    if (!s.loggedIn) {
      return (
        <div id="main-content">
          <Login />
        </div>
      );
    }
    const history = createHashHistory() as unknown; // TODO: align types between 'history' and 'preact-router'
    return (
      <div id="main-content">
        {isDesktopNonMac ? (
          <div className="windows-titlebar">
            <span>iris</span>
            <div className="title-bar-btns">
              <button className="min-btn" onClick={() => this.electronCmd('minimize')}>
                -
              </button>
              <button className="max-btn" onClick={() => this.electronCmd('maximize')}>
                +
              </button>
              <button className="close-btn" onClick={() => this.electronCmd('close')}>
                x
              </button>
            </div>
          </div>
        ) : null}
        <section
          className={`main ${isDesktopNonMac ? 'desktop-non-mac' : ''} ${
            s.showMenu ? 'menu-visible-xs' : ''
          }`}
          style="flex-direction: row;"
        >
          <Menu />
          <Helmet titleTemplate={titleTemplate} defaultTitle={defaultTitle}>
            <title>{title}</title>
            <meta name="description" content="Social Networking Freedom" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content="Social Networking Freedom" />
            <meta property="og:url" content={`https://iris.to/${window.location.hash}`} />
            <meta property="og:image" content="https://iris.to/assets/img/cover.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
          </Helmet>
          <div className="overlay" onClick={() => this.onClickOverlay()}></div>
          <div className="view-area">
            <Router history={history as CustomHistory} onChange={(e) => this.handleRoute(e)}>
              <Feed path="/" />
              <Feed path="/feed" />
              <Hashtags path="/hashtag" />
              <Feed path="/hashtag/:hashtag+" />
              <Feed path="/search/:term?/:type?" />
              <Feed path="/media" index="media" thumbnails />
              <Login path="/login" />
              <Notifications path="/notifications" />
              <Chat path="/chat/hashtag/:hashtag?" />
              <Chat path="/chat/:id?" />
              <Chat path="/chat/new/:id" />
              <Message path="/post/:hash+" />
              <Torrent path="/torrent/:id+" />
              <About path="/about" />
              <Settings path="/settings/:page?" />
              <LogoutConfirmation path="/logout" />
              <Profile path="/profile/:id+" tab="profile" />
              <Profile path="/replies/:id+" tab="replies" />
              <Profile path="/likes/:id+" tab="likes" />
              <Profile path="/media/:id+" tab="media" />
              <Profile path="/nfts/:id+" tab="nfts" />
              <Group path="/group/:id+" />
              {/* Lazy load stuff that is used less often */}
              <AsyncRoute
                path="/store/:store?"
                getComponent={() => import('./views/Store').then((module) => module.default)}
              />
              <AsyncRoute
                path="/checkout/:store?"
                getComponent={() => import('./views/Checkout').then((module) => module.default)}
              />
              <AsyncRoute
                path="/product/:product/:store"
                getComponent={() => import('./views/Product').then((module) => module.default)}
              />
              <AsyncRoute
                path="/product/new"
                store={iris.session.getPubKey()}
                getComponent={() => import('./views/Product').then((module) => module.default)}
              />
              <AsyncRoute
                path="/explorer/:node"
                getComponent={() => import('./views/Explorer').then((module) => module.default)}
              />
              <AsyncRoute
                path="/explorer"
                store={iris.session.getPubKey()}
                getComponent={() => import('./views/Explorer').then((module) => module.default)}
              />
              <Follows path="/follows/:id" />
              <Follows followers={true} path="/followers/:id" />
              <Contacts path="/contacts" />
            </Router>
          </div>
        </section>
        <MediaPlayer />
        <Footer />
        <VideoCall />
      </div>
    );
  }
}

Helpers.showConsoleWarning();

export default Main;
