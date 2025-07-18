import { enableExperimentalApps, APP_TYPES } from './applist.js';
import { AppProps } from '../app/props.js';
import {
  blobToStr,
  md5,
  UrlUtil,
  isEmptyString,
  isValidString,
  isLocalhostOrHttps,
} from '../util';
import { resolveImagePath } from '../images';

class AppRegistry {
  static instance = AppRegistry.instance || new AppRegistry();

  constructor() {
    this.updateAppTypes();
    this.allowMultiThreaded = false;
  }

  APP_TYPES = {}

  enableExpApps(b) {
    enableExperimentalApps(b);
    this.updateAppTypes();
  }

  updateAppTypes() {
    this.APP_TYPES = {}
    APP_TYPES.forEach((appType) => {
      this.APP_TYPES[appType.key] = appType;
      appType.type = appType.absoluteKey === undefined ?
        appType.key : appType.absoluteKey;
    });
  }

  validate(app) {
    const APP_TYPES = this.APP_TYPES;
    if (isEmptyString(app.title)) {
      throw new Error("Missing 'title' property");
    }
    if (isEmptyString(app.type)) {
      throw new Error("Missing 'type' property");
    }
    if (APP_TYPES[app.type] === undefined) {
      throw new Error("'type' is invalid.");
    }
    if (this.isMultiThreaded(app.type) && (!this.allowMultiThreaded && !isLocalhostOrHttps())) {
      throw new Error("is multi-threaded, and not localhost or https.");
    }
    APP_TYPES[app.type].validate(app);
  }

  getDefaultBackground(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].background;
  }

  getDefaultThumbnail(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].thumbnail;
  }

  getBackground(app) {
    return isValidString(app.background) ?
      app.background : this.getDefaultBackground(app);
  }

  getThumbnail(app) {
    return isValidString(app.thumbnail) ?
      app.thumbnail : this.getDefaultThumbnail(app);
  }

  getDescription(app) {
    const APP_TYPES = this.APP_TYPES;
    return isValidString(app.description) ?
      app.description : APP_TYPES[app.type].description;
  }

  getName(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].name;
  }

  isDelayedExit(app) {
    const { APP_TYPES } = this;
    const appType = APP_TYPES[app.type];
    return true; // Testing delayed exit on all apps
    // return appType.isDelayedExit !== undefined &&
    //   appType.isDelayedExit === true;
  }

  isSlowExit(app) {
    const { APP_TYPES } = this;
    const appType = APP_TYPES[app.type];
    return appType.slowExit !== undefined &&
      appType.slowExit === true;
  }

  getAlias(typeName) {
    const { APP_TYPES } = this;
    const appType = APP_TYPES[typeName];
    return appType.alias;
  }

  getLocation(app, context, feedProps, otherProps) {
    const { RP_CONTEXT, RP_DEBUG, RP_PROPS } = AppProps;
    const { APP_TYPES } = this;

    const appType = APP_TYPES[app.type];
    let outProps = {
      type: appType.type,
      title: this.getLongTitle(app),
      mt: appType?.multiThreaded,
      app: this.getName(app)
    };

    if (otherProps) {
      outProps = {...outProps, ...otherProps};
    }

    //feed logic
    if (props) {
      if (appType.addProps) {
        console.log("using feed for location");
        appType.addProps(props, outProps);
      } else {
        Object.assign(outProps, props);
      }
    } else if (app?.props) {
      Object.assign(outProps, app.props);
    }

    let loc = UrlUtil.addParam(
      appType.location, RP_PROPS, AppProps.encode(outProps));

    const debug = UrlUtil.getBoolParam(
      window.location.search, RP_DEBUG);
    if (debug) {
      loc = UrlUtil.addParam(loc, RP_DEBUG, 'true');
    }
    if (context) {
      loc = UrlUtil.addParam(loc, RP_CONTEXT, context);
    }
    if (appType.addParams) {
      loc = appType.addParams(loc);
    }

    return loc;
  }

  getTitle(app) {
    return app.title;
  }

  isMultiThreaded(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return t.multiThreaded;
  }

  getLongTitle(app) {
    return isValidString(app.longTitle) ?
      app.longTitle : this.getTitle(app);
  }

  getNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];

    return (t.absoluteKey ?
      this.getGeneralNameForType(type) :
      this.getCoreNameForType(type));
  }

  getShortNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];

    return (t.absoluteKey ?
      this.getGeneralShortNameForType(type) :
      this.getShortCoreNameForType(type));
  }

  getGeneralNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[type].name;
  }

  getGeneralShortNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return t.shortName ? t.shortName : t.name;
  }

  getCoreNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return `${this.getNameForType(type)} (${t.coreName})`;
  }

  getShortCoreNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return `${this.getGeneralShortNameForType(type)} (${t.coreName})`;
  }

  getThumbnailForType(type, imgSrc) {
    return isValidString(imgSrc) ?
      imgSrc : this.getDefaultThumbnailForType(type);
  }

  getDefaultThumbnailForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return resolveImagePath(APP_TYPES[type].thumbnail);
  }

  getBackgroundForType(type, imgSrc) {
    return isValidString(imgSrc) ?
      imgSrc : this.getDefaultBackgroundForType(type);
  }

  getDefaultBackgroundForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return resolveImagePath(APP_TYPES[type].background);
  }

  getDefaultsForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[type].defaults;
  }

  getAppTypes() {
    return this.APP_TYPES;
  }

  getTypeForExtension(ext) {
    const APP_TYPES = this.APP_TYPES;
    ext = ext.toLowerCase();

    let retType = null;
    for (const name in APP_TYPES) {
      const type = APP_TYPES[name];
      if (type.extensions) {
        for (let j = 0; j < type.extensions.length; j++) {
          if (ext === type.extensions[j] &&
            (retType === null || type.absoluteKey)) {
            retType = type;
          }
        }
      }
    }
    return retType;
  }

  getAllExtensions(dotted = true, nonUnique = false) {
    const extensions = []
    if (nonUnique) {
      extensions.push((dotted ? "." : "") + "bin");
    }
    const APP_TYPES = this.APP_TYPES;
    for (const name in APP_TYPES) {
      const type = APP_TYPES[name];
      if (type.extensions && !type.absoluteKey) {
        for (let j = 0; j < type.extensions.length; j++) {
          extensions.push((dotted ? "." : "") + type.extensions[j]);
        }
      }
    }
    return extensions;
  }

  getExtensions(name, dotted = true, nonUnique = false) {
    const extensions = []
    if (nonUnique) {
      extensions.push((dotted ? "." : "") + "bin");
    }
    const APP_TYPES = this.APP_TYPES;
    let type = APP_TYPES[name];
    if (type.absoluteKey) {
      type = APP_TYPES[type.absoluteKey];
    }
    if (type.extensions) {
      for (let j = 0; j < type.extensions.length; j++) {
        extensions.push((dotted ? "." : "") + type.extensions[j]);
      }
    }
    return extensions;
  }

  testMagic(bytes) {
    const APP_TYPES = this.APP_TYPES;

    const testLast = [];
    for (const name in APP_TYPES) {
      const type = APP_TYPES[name];
      if (type.absoluteKey && type.testMagic) {
        if (type.testMagicLast !== undefined && type.testMagicLast == true) {
          testLast.push(type);
        } else {
          //console.log('Testing magic: ' + type.absoluteKey);
          if (type.testMagic(bytes)) {
            return type;
          }
        }
      }
    }

    for (let i = 0; i < testLast.length; i++) {
      const type = testLast[i];
      //console.log('Testing magic (last): ' + type.absoluteKey);
      if (type.testMagic(bytes)) {
        return type;
      }
    }

    return null;
  }

  async getMd5(blob, type = null) {
    const APP_TYPES = this.APP_TYPES;
    let result = null;

    if (type && (typeof type === 'string')) {
      type = APP_TYPES[type];
    }
    if (type && type.getMd5) {
      result = await type.getMd5(blob);
    }

    return result != null ? result : md5(await blobToStr(blob));
  }

  setAllowMultiThreaded(val) {
    this.allowMultiThreaded = val;
  }
}

export { AppRegistry };
