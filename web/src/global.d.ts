declare module '*.png' {
    const url: string;
    export = url;
}

declare module '*.gif' {
    const url: string;
    export = url;
}

declare module '*.jpg' {
    const url: string;
    export = url;
}

declare module '*.scss' {
    interface IClassNames {
        [className: string]: string;
    }
    const classNames: IClassNames;
    export = classNames;
}

declare module 'js-sha1';
declare const API_URL: string;
