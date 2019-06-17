import * as React from 'react';
import { docsService } from '../../services';
import { connect, ConnectedComponent } from '../connectedComponent';
import DocsStore from '../../stores/DocsStore';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import marked from 'marked';
import Optional from 'optional-js';
import hljs from 'highlight.js';

import './Docs.scss';
import 'highlight.js/styles/dracula.css';
import 'github-markdown-css/github-markdown.css';
import { TableOfContentsNav } from './TableOfContentsNav';
import { boundMethod } from 'autobind-decorator';
import OptionalUtils from '../../util/OptionalUtils';

interface DocsPathParams {
  path: string;
}

interface Props extends RouteComponentProps<DocsPathParams> {}

interface Stores {
  docsStore: DocsStore;
}

const renderer = new marked.Renderer();

function sanitize(str: string) {
  return str.replace(/&<"/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    return '&quot;';
  });
}

renderer.image = function(src, title, alt) {
  const exec = /=\s*(\d*)\s*x\s*(\d*)\s*$/.exec(title);
  let res = '<img src="' + sanitize(src) + '" alt="' + sanitize(alt);
  if (exec && exec[1]) res += '" height="' + exec[1];
  if (exec && exec[2]) res += '" width="' + exec[2];
  return res + '">';
};

marked.setOptions({
  renderer: renderer,
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

@connect('docsStore')
@observer
export default class Docs extends ConnectedComponent<Props, Stores> {
  componentDidMount(): void {
    docsService
      .fetchAndUpdateToc()
      .then(() =>
        docsService.fetchAndUpdateDocContent(Optional.ofNullable(this.props.match.params.path).orElse('index'))
      );
  }

  @boundMethod
  private handleDocumentationClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // Hijack link clicks so that we can make them go through the hash router history object thing.
    // We might be able to remove this logic when we go to the browser router.
    OptionalUtils.safeGet(() => OptionalUtils.trimToNull((event.target as any).href).get()).ifPresent(url => {
      if (!url.startsWith(window.location.origin)) {
        return;
      }

      event.preventDefault(); // Stop the browser default action so we can use react routers push, so that the new docs are downloaded

      const dest = url.replace(`${window.location.origin}${process.env.PUBLIC_URL}`, '').replace(/.md$/, '');
      this.props.history.push(dest);
      if (url.includes('docs')) {
        window.location.reload();
      }
    });
  }

  render(): React.ReactNode {
    const content: Optional<string> = Optional.ofNullable(this.stores.docsStore.content);
    return (
      <div className="documentation-wrapper">
        <TableOfContentsNav
          path={Optional.ofNullable(this.props.match.params.path).orElse('index')}
          tableOfContents={this.stores.docsStore.tableOfContents}
          history={this.props.history}
        />
        <div
          className="markdown-body"
          onClick={this.handleDocumentationClick}
          dangerouslySetInnerHTML={{ __html: marked.parse(content.orElse(' ')) }}
        />
      </div>
    );
  }
}
