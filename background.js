window.ALATION_START_CAPTURE = {};
window.ALATION_CAPTURED_METRICS = {};

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: 'alation'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: 'local'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details){
    var windowId = details.tabId;
    if (window.ALATION_START_CAPTURE[windowId]) {
      var metricsBody = JSON.parse(details.requestBody.formData.metrics[0]);
      window.ALATION_CAPTURED_METRICS[windowId] = window.ALATION_CAPTURED_METRICS[windowId] || [];
      window.ALATION_CAPTURED_METRICS[windowId] = window.ALATION_CAPTURED_METRICS[windowId].concat(metricsBody);
    }
    return {};
  },
  {
    urls: [ "*://*/metrics/collect/" ],
    types: ['xmlhttprequest']
  },
  ['requestBody']
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.alation_metrics_ext_event) {
    case 'start_capture':
      window.ALATION_START_CAPTURE[request.alation_metrics_ext_window] = true;
      break;
    case 'stop_capture':
      window.ALATION_START_CAPTURE[request.alation_metrics_ext_window] = false;
      break;
    case 'clear_capture':
      window.ALATION_CAPTURED_METRICS[request.alation_metrics_ext_window] = [];
      break;
    case 'get_metrics':
      sendResponse({
        results: window.ALATION_CAPTURED_METRICS[request.alation_metrics_ext_window] || []
      });
      break;
    case 'get_is_capturing':
      sendResponse({
        results: window.ALATION_START_CAPTURE[request.alation_metrics_ext_window]
      });
      break;
    default:
      break;
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  delete window.ALATION_START_CAPTURE[tabId];
  delete window.ALATION_CAPTURED_METRICS[tabId];
});

