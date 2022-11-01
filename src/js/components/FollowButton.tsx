import iris from 'iris-lib';

import Component from '../BaseComponent';
import { translate as t } from '../translations/Translation';

import Button from './basic/Button';

type Props = {
  id: string;
};

class FollowButton extends Component<Props> {
  key: string;
  cls?: string;
  actionDone: string;
  action: string;
  activeClass: string;
  hoverAction: string;

  constructor() {
    super();
    this.key = 'follow';
    this.actionDone = 'following';
    this.action = 'follow';
    this.activeClass = 'following';
    this.hoverAction = 'unfollow';
  }

  onClick(e) {
    e.preventDefault();
    const value = !this.state[this.key];
    if (value && this.key === 'follow') {
      iris.session.newChannel(this.props.id);
      iris.public().get('block').get(this.props.id).put(false);
      iris.notifications.sendIrisNotification(this.props.id, {
        event: 'follow',
      });
    }
    if (value && this.key === 'block') {
      iris.public().get('follow').get(this.props.id).put(false);
    }
    iris.public().get(this.key).get(this.props.id).put(value);
    iris.public().get(this.key).get(this.props.id).put(value);
  }

  componentDidMount() {
    iris
      .public()
      .get(this.key)
      .get(this.props.id)
      .on(
        this.sub((value) => {
          const s = {};
          s[this.key] = value;
          this.setState(s);
        }),
      );
  }

  render() {
    return (
      <Button
        className={`${this.cls || this.key} ${this.state[this.key] ? this.activeClass : ''}`}
        onClick={(e) => this.onClick(e)}
      >
        <span className="nonhover">{t(this.state[this.key] ? this.actionDone : this.action)}</span>
        <span className="hover">{t(this.hoverAction)}</span>
      </Button>
    );
  }
}

export default FollowButton;
