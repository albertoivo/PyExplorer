import 'i18next';
import type common from './locales/pt/common.json';
import type home from './locales/pt/home.json';
import type auth from './locales/pt/auth.json';
import type about from './locales/pt/about.json';
import type learn from './locales/pt/learn.json';
import type game from './locales/pt/game.json';
import type gamification from './locales/pt/gamification.json';
import type worlds from './locales/pt/worlds.json';
import type notFound from './locales/pt/notFound.json';

export interface Resources {
    common: typeof common;
    home: typeof home;
    auth: typeof auth;
    about: typeof about;
    learn: typeof learn;
    game: typeof game;
    gamification: typeof gamification;
    worlds: typeof worlds;
    notFound: typeof notFound;
}

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: Resources;
    }
}
