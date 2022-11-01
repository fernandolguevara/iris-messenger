import { html } from 'htm/preact';
import iris from 'iris-lib';

import Component from '../BaseComponent';

import Identicon from './Identicon';
import Name from './Name';

export default class HashtagSubscriberList extends Component {
  constructor() {
    super();
    this.subs = new Set();
  }

  componentDidMount() {
    iris.group().on(
      `hashtagSubscriptions/${this.props.hashtag}`,
      this.sub((isSubscribed, hashtag, a, b, from) => {
        isSubscribed ? this.subs.add(from) : this.subs.delete(from);
        this.setState({});
      }),
    );
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    const subs = Array.from(this.subs);
    return html`
      ${subs.length
        ? html`
            <div class="msg hashtag-list">
              <div class="msg-content">
                #${this.props.hashtag} subscribers (${subs.length})<br /><br />

                ${subs.map(
                  (k) =>
                    html`
                      <a href="/profile/${k}">
                        <span class="text">
                          <${Identicon} key="i${k}" str=${k} width="30" activity=${true} />
                          <${Name} pub=${k} key="t${k}" />
                        </span>
                      </a>
                    `,
                )}
              </div>
            </div>
          `
        : ''}
    `;
  }
}
