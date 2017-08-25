/**
 *@param { function } switchLanguageList 返回promise对象的语言包，如webpack的import
 * return import(`src/locale/${language}`).then(language => {});
 *@param { array } defaultLanguageList 默认语言翻译列表
 */
export default function i18N(switchLanguageList, defaultLanguageList) {
  var displayName = 'i18n';
  //中转作用
  var __Locale__;
  var changedLanguageList;
  /**
   *@param { object } routeControllerComponentObj 实例化后的routeController
   */
  return routeControllerComponentObj => {
    function switchLanguage(language, reRender = true) {
      return switchLanguageList(language).then(languageList => {
        if (!languageList) {
          return false;
        }
        localStorage.currentLanguage = language;
        changedLanguageList = languageList.default;
        if (reRender) {
          routeControllerComponentObj.reRender();
        }
        return languageList.default;
      });
    }
    function t(str) {
      if (!__Locale__) {
        __Locale__ = {};
        defaultLanguageList.forEach((v, k) => {
          __Locale__[v] = k;
        });
      }
      if (changedLanguageList) {
        var o = changedLanguageList[__Locale__[str]];
        if (o) {
          return o;
        }
      }
      return str;
    }
    if (localStorage.currentLanguage) {
      return switchLanguage(
        localStorage.currentLanguage,
        false
      ).then(languageList => {
        changedLanguageList = languageList;
        return {
          displayName,
          t,
          switchLanguage,
        };
      });
    }
    return {
      displayName,
      t: t,
      switchLanguage,
    };
  };
}
