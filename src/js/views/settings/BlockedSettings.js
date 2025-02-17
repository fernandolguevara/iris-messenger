import iris from 'iris-lib';
import filter from 'lodash/filter';

import Component from '../../BaseComponent';
import Text from '../../components/Text';
import { translate as t } from '../../translations/Translation';

export default class BlockedSettings extends Component {
  constructor() {
    super();
    this.state = iris.session.DEFAULT_SETTINGS;
    this.state.webPushSubscriptions = {};
    this.state.blockedUsers = {};
    this.id = 'settings';
  }
  render() {
    const blockedUsers = filter(
      Object.keys(this.state.blockedUsers),
      (user) => this.state.blockedUsers[user],
    );

    return (
      <>
        <div class="centered-container">
          <h3>{t('blocked_users')}</h3>
          {blockedUsers.map((user) => {
            if (this.state.blockedUsers[user]) {
              return (
                <p key={user}>
                  <a href={`/profile/${encodeURIComponent(user)}`}>
                    <Text user={user} path="profile/name" placeholder="User" />
                  </a>
                </p>
              );
            }
          })}
          {blockedUsers.length === 0 ? t('none') : ''}
        </div>
      </>
    );
  }
  componentDidMount() {
    const blockedUsers = {};

    iris.electron && iris.electron.get('settings').on(this.inject('electron', 'electron'));
    iris
      .local()
      .get('settings')
      .on(
        this.sub((local) => {
          console.log('local settings', local);
          if (local) {
            this.setState({ local });
          }
        }),
      );
    iris
      .public()
      .get('block')
      .map()
      .on(
        this.sub((v, k) => {
          blockedUsers[k] = v;
          this.setState({ blockedUsers });
        }),
      );
  }
}
