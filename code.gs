function getDataUsageInfo(email,password) {

  // Login request
  var loginUrl = 'https://linksmate.jp/api/mypage/login';
  var loginOptions = {
    'method': 'post',
    'headers': {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    'payload': {
      'data[mail]': email,
      'data[password]': password
    },
    'followRedirects': false
  };

  // Execute login request
  var loginResponse = UrlFetchApp.fetch(loginUrl, loginOptions);
  var cookies = loginResponse.getHeaders()['Set-Cookie'];

  // Check if cookies are obtained
  if (!cookies) {
    return 'Login failed. Unable to obtain cookies.';
  }

  // Data request
  var dataUrl = 'https://linksmate.jp/api/mypage/data/';
  var dataOptions = {
    'method': 'get',
    'headers': {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Cookie': cookies,
    }
  };

  // Execute data request
  var htmlContent;
  try {
    htmlContent = UrlFetchApp.fetch(dataUrl, dataOptions).getContentText();
  } catch (error) {
    return 'Error occurred while fetching data: ' + error.message;
  }

  // Extract data using regular expressions
  try {
    var countFreeOption = htmlContent.match(/カウントフリーオプション：<b class="orange-note size-18">([^<]+)<\/b>/)[1];
    var remainingCapacity = htmlContent.match(/<span>残容量<\/span>\s*<br><br>\s*<span>([^<]+)<\/span>/)[1];
    var currentMonthRemainingData = htmlContent.match(/<td class="u-pb10"><span\s+class="graph-color-sample __color-blue"><\/span>当月のデータ通信残量\s*<\/td>\s*<td class="text-right">(\d+)MB<\/td>/)[1];
    var currentMonthAdditionalData = htmlContent.match(/<td class="u-pb10"><span\s+class="graph-color-sample __color-red"><\/span>当月追加したデータ通信残量\s*<\/td>\s*<td class="text-right">(\d+)MB<\/td>/)[1];
    var carryOverRemainingData = htmlContent.match(/<td class="u-pb10"><span\s+class="graph-color-sample __color-orange"><\/span>繰り越しデータ通信残量\s*<\/td>\s*<td class="text-right">(\d+)MB<\/td>/)[1];
    var countFreeOptionUsage = htmlContent.match(/<td class="u-w70">カウントフリーオプション対象データ通信<\/td>\s*<td class="text-right u-w30">(\d+)MB<\/td>/)[1];
    var normalDataUsage = htmlContent.match(/<td class="u-w70">通常データ通信<\/td>\s*<td class="text-right u-w30">(\d+)MB<\/td>/)[1];
  } catch (error) {
    return 'Error occurred while extracting data: ' + error.message;
  }

  // Format output
  var output = [
    "カウントフリーオプション: " + countFreeOption,
    "**残容量** " + remainingCapacity,
    "当月のデータ通信残量: " + currentMonthRemainingData + "MB",
    "当月追加したデータ通信残量: " + currentMonthAdditionalData + "MB",
    "繰り越しデータ通信残量: " + carryOverRemainingData + "MB",
    "**使用量**",
    "カウントフリーオプション対象データ通信: " + countFreeOptionUsage + "MB",
    "通常データ通信: " + normalDataUsage + "MB"
  ].join("\n");

  return output;
}

function sendToDiscordWebhook(webhookUrl, message) {
  var payload = {
    'content': message
  };

  var options = {
    'method': 'post',
    'headers': {
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(webhookUrl, options);
    Logger.log('Message sent to Discord successfully.');
  } catch (error) {
    Logger.log('Error sending message to Discord: ' + error.message);
  }
}

function main() {
  var webhookUrl = '';
  var email = '';
  var password = '';
  var result = getDataUsageInfo(email,password);
  sendToDiscordWebhook(webhookUrl, result);
}
