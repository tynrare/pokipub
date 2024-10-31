/**
 * poki suggets to show ad right after loading.
 */
export default function PokiWrap() {
  this.load = load;
  this.confirm_loading = confirm_loading;
  this.confirm_start = confirm_start;
  this.confirm_stop = confirm_stop;
  this.show_ads = show_ads;
  this.show_rewarded_ads = show_rewarded_ads;

  /**
   * @async
   * @returns {Promise}
   */
  function load() {
    if (!window.PokiSDK) {
      throw new Error(
        `
        add <script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script> at index.html
        `
      );
    }
    return PokiSDK.init().then(() => PokiSDK.setDebug(true)).catch((err) => {
      console.error(`Ошибка инициализации poki: `, err)
    })
  }

  function confirm_loading() {
    // We're done loading!
    PokiSDK.gameLoadingFinished();
  }

  function confirm_start() {
    PokiSDK.gameplayStart();
  }

  function confirm_stop() {
    PokiSDK.gameplayStop();
  }

  /**
   *
   * @param {function?} started
   * @returns {Promise}
   */
  function show_ads({ started, end } = {}) {
    return PokiSDK.commercialBreak(() => {
      if (started) {
        started();
      }
    }).then(() => {
      if (end) {
        end();
      }
    });
  }

  /**
   *
   * @param {function?} started callback on ad start
   * @param {function?} rewarded callback on ad watched
   * @param {function?} skipped callback on ad skipped
   * @param {function?} end callback on any ad end
   * @returns {Promise}
   */
  function show_rewarded_ads({ started, rewarded, skipped, end } = {}) {
    return PokiSDK.rewardedBreak(() => {
      if (started) {
        started();
      }
    }).then((_rewarded) => {
      if (_rewarded && rewarded) {
        rewarded();
      } else if (skipped) {
        skipped();
      }

      if (end) {
        end(_rewarded);
      }

      return _rewarded;
    });
  }
}
