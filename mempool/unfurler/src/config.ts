const configFile = require('../config.json');

interface IConfig {
  SERVER: {
    HOST: 'http://localhost';
    HTTP_PORT: number;
    STDOUT_LOG_MIN_PRIORITY: string;
  };
  MEMPOOL: {
    HTTP_HOST: string;
    HTTP_PORT: number;
    NETWORK?: string;
  };
  PUPPETEER: {
    ENABLED: boolean;
    CLUSTER_SIZE: number;
    EXEC_PATH?: string;
    MAX_PAGE_AGE?: number;
    RENDER_TIMEOUT?: number;
  };
  SYSLOG: {
    ENABLED: boolean;
    HOST: string;
    PORT: number;
    MIN_PRIORITY: 'emerg' | 'alert' | 'crit' | 'err' | 'warn' | 'notice' | 'info' | 'debug';
    FACILITY: string;
  };
}

const defaults: IConfig = {
  'SERVER': {
    'HOST': 'http://localhost',
    'HTTP_PORT': 4201,
    'STDOUT_LOG_MIN_PRIORITY': 'debug',
  },
  'MEMPOOL': {
    'HTTP_HOST': 'http://localhost',
    'HTTP_PORT': 4200,
  },
  'PUPPETEER': {
    'ENABLED': true,
    'CLUSTER_SIZE': 1,
  },
  'SYSLOG': {
    'ENABLED': true,
    'HOST': '127.0.0.1',
    'PORT': 514,
    'MIN_PRIORITY': 'info',
    'FACILITY': 'local7'
  },
};

class Config implements IConfig {
  SERVER: IConfig['SERVER'];
  MEMPOOL: IConfig['MEMPOOL'];
  PUPPETEER: IConfig['PUPPETEER'];
  SYSLOG: IConfig['SYSLOG'];

  constructor() {
    const configs = this.merge(configFile, defaults);
    this.SERVER = configs.SERVER;
    this.MEMPOOL = configs.MEMPOOL;
    this.PUPPETEER = configs.PUPPETEER;
    this.SYSLOG = configs.SYSLOG;
  }

  merge = (...objects: object[]): IConfig => {
    // @ts-ignore
    return objects.reduce((prev, next) => {
      Object.keys(prev).forEach(key => {
        next[key] = { ...next[key], ...prev[key] };
      });
      return next;
    });
  }
}

export default new Config();
