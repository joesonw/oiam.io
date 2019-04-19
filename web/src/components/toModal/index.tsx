import * as Q from 'q';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default function toModal<T>(render: (resolve: (v: T) => void) => React.ReactNode): Promise<T> {
    const d = Q.defer<T>();

    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(
        (
            <React.Fragment>
                {render(v => d.resolve(v))}
            </React.Fragment>
        ),
        container,
    );

    return new Promise((resolve, reject) => {
        d.promise.then((flag) => {
            ReactDOM.unmountComponentAtNode(container);
            document.body.removeChild(container);
            resolve(flag);
        }).catch(reject);
    });
}
